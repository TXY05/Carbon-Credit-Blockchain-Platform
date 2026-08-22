let web3;
let currentAccount;

// 【请确保这里是你在 Remix 部署的真实合约地址】
const contractAddress = "0xF0CF4f8656B5A5BE0F700D76eaA7699cEceDcd1d"; 
const contractABI = [
    {
        "inputs": [
            { "internalType": "address", "name": "to", "type": "address" },
            { "internalType": "uint256", "name": "amount", "type": "uint256" }
        ],
        "name": "mint",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

// Node.js 后端服务器地址
const SERVER_URL = "http://localhost:3000";

// ==========================================
// UI 逻辑：切换 Login 和 Register 面板
// ==========================================
window.toggleAuthMode = function(mode) {
    if (mode === 'login') {
        document.getElementById('form-login').style.display = 'block';
        document.getElementById('form-register').style.display = 'none';
        document.getElementById('tab-login').style.background = '#5640fa';
        document.getElementById('tab-login').style.color = 'white';
        document.getElementById('tab-register').style.background = '#f4f7fe';
        document.getElementById('tab-register').style.color = '#2b3674';
    } else {
        document.getElementById('form-login').style.display = 'none';
        document.getElementById('form-register').style.display = 'block';
        document.getElementById('tab-register').style.background = '#5640fa';
        document.getElementById('tab-register').style.color = 'white';
        document.getElementById('tab-login').style.background = '#f4f7fe';
        document.getElementById('tab-login').style.color = '#2b3674';
    }
};

// ==========================================
// 注册逻辑
// ==========================================
window.handleRegister = async function() {
    let rRole = document.getElementById("regRole").value;
    let rUser = document.getElementById("regUsername").value;
    let rPass = document.getElementById("regPassword").value;

    if(!rUser || !rPass) {
        alert("🚨 请填写完整账号和密码！");
        return;
    }

    try {
        let response = await fetch(`${SERVER_URL}/register`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: rUser, password: rPass, role: rRole })
        });

        let result = await response.json();
        
        if(result.success) {
            // 🔴 防呆保护：如果后端给了 message 就用后端的，没给就用默认的
            alert(result.message || "✅ 注册成功！请等待 Admin 审核。");
            
            // 注册成功后清空输入框
            document.getElementById("regUsername").value = "";
            document.getElementById("regPassword").value = "";
        } else {
            alert("❌ 注册失败: " + result.message);
        }
    } catch (error) {
        console.error(error);
        alert("🚨 请求报错，请确保 node server.js 正在运行！");
    }
};

window.handleLogin = async function() {
    let logUser = document.getElementById("logUsername").value;
    let logPass = document.getElementById("logPassword").value;

    if(!logUser || !logPass) {
        alert("🚨 请填写完整的账号和密码！");
        return;
    }

    try {
        let response = await fetch(`${SERVER_URL}/login`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: logUser, password: logPass })
        });

        let result = await response.json();
        
        if(result.success) {
            localStorage.setItem('loggedInUser', result.username);
            alert("✅ 登录成功！");
            
            document.getElementById("logUsername").value = "";
            document.getElementById("logPassword").value = "";
            
            // 1. 根据角色解锁对应的侧边栏菜单
            switchRole(result.role);
            if (typeof syncGlobalAvatar === 'function') syncGlobalAvatar();

            // 2. 🔴 完美接入你的真实路由函数！跳转到 Marketplace
            navTo('marketPage', 'Carbon Marketplace'); 
            
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error(error);
        alert("🚨 请求报错，请检查控制台。");
    }
};

// ==========================================
// 1. 钱包连接逻辑 (左下角按钮)
// ==========================================
const connectBtn = document.getElementById("connectWalletBtn");

if (connectBtn) {
    connectBtn.onclick = async function() {
        // 检查浏览器有没有安装 MetaMask
        if (typeof window.ethereum !== 'undefined') {
            web3 = new Web3(window.ethereum);
            try {
                // 唤醒 MetaMask 请求授权
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                currentAccount = accounts[0];
                
                // 酷炫细节 1：改变左下角按钮的文字和颜色，变成绿色已连接状态
                connectBtn.innerHTML = `✅ ${currentAccount.substring(0,6)}...${currentAccount.substring(38)}`;
                connectBtn.style.background = "#28a745"; 
                connectBtn.style.borderColor = "#28a745";

                // 酷炫细节 2：如果当前在 Developer 页面，自动把地址填入表单
                let devAddressInput = document.getElementById("devAddress");
                if (devAddressInput) {
                    devAddressInput.value = currentAccount;
                    devAddressInput.style.color = "#5640fa";
                }
                
                alert(`🎉 钱包连接成功！\n链上身份已确认为: ${currentAccount}`);
            } catch (error) {
                console.error("用户拒绝了连接", error);
                alert("❌ 连接失败：你可能在 MetaMask 弹窗里点击了拒绝。");
            }
        } else {
            alert("🚨 未检测到 Web3 环境！请确保你的浏览器安装了 MetaMask (小狐狸) 插件。");
        }
    };
} else {
    console.error("严重错误：在 HTML 里找不到 id 为 connectWalletBtn 的按钮！");
}

// ==========================================
// 2. Developer：提交项目逻辑
// ==========================================
document.getElementById("submitBtn").onclick = async function() {
    // 抓取刚刚在高级 UI 里新增的 Project Name
    let pName = document.getElementById("projName") ? document.getElementById("projName").value : "";
    let address = document.getElementById("devAddress").value;
    let loc = document.getElementById("location").value;
    let cap = document.getElementById("capacity").value;
    let dead = document.getElementById("deadline").value;

    // 基础防呆校验
    if (!address || !loc || !cap || !dead) {
        alert("🚨 请填完所有 Developer 资料！(钱包地址必须先点击 Connect MetaMask 获取)");
        return;
    }

    const projectData = { 
        projName: pName, 
        devAddress: address, 
        location: loc, 
        capacity: cap, 
        deadline: dead 
    };

    try {
        let response = await fetch(`${SERVER_URL}/submit-project`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(projectData)
        });
        let result = await response.json();
        
        if(result.success) {
            alert("✅ 项目提交成功！已进入 Node.js 待审核队列，请等待 Admin 处理。");
            
            // 提交成功后清空表单（保留钱包地址）
            if(document.getElementById("projName")) document.getElementById("projName").value = "";
            document.getElementById("location").value = ""; 
            document.getElementById("capacity").value = "";
        } else {
            alert("❌ 提交失败: " + result.message);
        }
    } catch (error) {
        console.error("提交请求崩溃:", error);
        alert("提交失败，请确保你的终端里正在运行 node server.js ！");
    }
};

// ==========================================
// Admin：项目管理 (Tab切换逻辑)
// ==========================================
window.switchProjectTab = function(tab) {
    if (tab === 'pending') {
        document.getElementById('panel-pending-projects').style.display = 'block';
        document.getElementById('panel-all-projects').style.display = 'none';
        document.getElementById('tab-pending-projects').style.background = '#5640fa';
        document.getElementById('tab-pending-projects').style.color = 'white';
        document.getElementById('tab-all-projects').style.background = '#f4f7fe';
        document.getElementById('tab-all-projects').style.color = '#2b3674';
        loadPendingProjects();
    } else {
        document.getElementById('panel-pending-projects').style.display = 'none';
        document.getElementById('panel-all-projects').style.display = 'block';
        document.getElementById('tab-all-projects').style.background = '#5640fa';
        document.getElementById('tab-all-projects').style.color = 'white';
        document.getElementById('tab-pending-projects').style.background = '#f4f7fe';
        document.getElementById('tab-pending-projects').style.color = '#2b3674';
        loadAllProjects();
    }
};

// ==========================================
// 渲染待审核项目 (Pending)
// ==========================================
window.loadPendingProjects = async function() {
    try {
        let response = await fetch(`${SERVER_URL}/pending-projects`);
        let pendingProjects = await response.json();
        
        let tbody = document.getElementById("tableBody");
        if (!tbody) return; 
        tbody.innerHTML = ""; 

        if (pendingProjects.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #a3aed1; padding: 30px 0;">🎉 目前没有需要审核的项目</td></tr>`;
            return;
        }

        pendingProjects.forEach((proj) => {
            let row = `<tr>
                <td><strong>${proj.projName || 'Unnamed Project'}</strong></td>
                <td>${proj.location}</td>
                <td>${proj.capacity} ha</td>
                <td><strong style="color: #5640fa;">${proj.carbonVolume} BCC</strong></td>
                <td><span style="background: #fff0d4; color: #ff9800; padding: 5px 10px; border-radius: 8px; font-size: 13px;">Pending</span></td>
                <td>
                    <!-- 🔴 重点加上 type="button" -->
                    <button type="button" class="primary-btn" onclick="approveAndMint(${proj.id}, '${proj.devAddress}', ${proj.carbonVolume})" 
                            style="padding: 6px 12px; font-size: 13px; background-color: #28a745; margin-right: 5px;">
                        Approve
                    </button>
                    <!-- 🔴 重点加上 type="button" -->
                    <button type="button" class="primary-btn" onclick="rejectProject(${proj.id})" 
                            style="padding: 6px 12px; font-size: 13px; background-color: #dc3545;">
                        Reject
                    </button>
                </td>
            </tr>`;
            tbody.innerHTML += row;
        });
    } catch (error) { console.error(error); }
};

// ==========================================
// 审批与驳回 (绝对防闪回)
// ==========================================
window.approveAndMint = async function(projectId, devAddress, volume) {
    try {
        if (typeof web3 === 'undefined' || !currentAccount) {
            alert("🚨 请先点击左下角连接 MetaMask 钱包！");
            return;
        }

        const contract = new web3.eth.Contract(contractABI, contractAddress);
        let amountInWei = web3.utils.toWei(volume.toString(), 'ether');

        alert("⚠️ 准备唤醒 MetaMask 支付 Gas 费...");
        await contract.methods.mint(devAddress, amountInWei).send({ from: currentAccount });

        let response = await fetch(`${SERVER_URL}/approve-project`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: projectId })
        });
        
        let result = await response.json();
        if(result.success) {
            alert("🎉 发币成功！状态已更新。");
            loadPendingProjects(); // 🔴 原地局部刷新，保留当前页面
        }
    } catch (error) {
        console.error(error);
        alert("❌ 发币失败！请检查控制台报错。");
    }
};

window.rejectProject = async function(projectId) {
    if(!confirm("⚠️ 确定要驳回该项目吗？")) return;
    try {
        let response = await fetch(`${SERVER_URL}/reject-project`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: projectId })
        });
        if((await response.json()).success) {
            alert("🚫 项目已驳回。");
            loadPendingProjects(); // 🔴 原地局部刷新
        }
    } catch (error) { console.error(error); }
};

// ==========================================
// 渲染所有项目总览 (Overview) - 带强力报错
// ==========================================
let allProjectsData = [];

window.loadAllProjects = async function() {
    try {
        let response = await fetch(`${SERVER_URL}/all-projects`);
        
        // 核心防呆：如果后端没有这个接口，立刻拦截并弹窗警告
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        allProjectsData = await response.json();
        applyProjectFilters();
        
    } catch (error) { 
        console.error("加载大名单失败:", error); 
        alert("🚨 数据拉取失败！\n请确保你在 server.js 里加上了 /all-projects 接口，并且已经用 Ctrl+C 停止并重新启动了 node server.js！");
    }
};

window.applyProjectFilters = function() {
    const statusFilter = document.getElementById('filterProjectStatus').value;
    const startDate = document.getElementById('projDateStart').value;
    const endDate = document.getElementById('projDateEnd').value;

    let filtered = allProjectsData.filter(p => {
        let matchStatus = (statusFilter === 'all') || (p.status === statusFilter);
        
        // 日期比对逻辑
        let matchDate = true;
        if (p.createdAt) {
            let rowDate = p.createdAt.split(' ')[0];
            if (startDate && rowDate < startDate) matchDate = false;
            if (endDate && rowDate > endDate) matchDate = false;
        } else {
            if (startDate || endDate) matchDate = false;
        }
        
        return matchStatus && matchDate;
    });

    let tbody = document.getElementById("allProjectsTableBody");
    if(!tbody) return;
    tbody.innerHTML = ""; 

    filtered.forEach((p) => {
        let statusColor = p.status === 'approved' ? '#28a745' : (p.status === 'rejected' ? '#dc3545' : '#ff9800');
        let statusBg = p.status === 'approved' ? '#e6f4ea' : (p.status === 'rejected' ? '#fce8e6' : '#fff0d4');
        let displayDate = p.createdAt ? p.createdAt.split(' ')[0] : 'N/A';

        let row = `<tr>
            <td style="color: #a3aed1; font-size: 13px;">${displayDate}</td>
            <td><strong>${p.projName || 'Unnamed Project'}</strong></td>
            <td>${p.location}</td>
            <td>${p.capacity} ha</td>
            <td><strong style="color: #5640fa;">${p.carbonVolume} BCC</strong></td>
            <td><span style="background: ${statusBg}; color: ${statusColor}; padding: 5px 10px; border-radius: 8px; font-size: 13px; text-transform: capitalize;">${p.status}</span></td>
        </tr>`;
        tbody.innerHTML += row;
    });
};

// 🔴 新增：驳回项目逻辑
window.rejectProject = async function(projectId) {
    if(!confirm("⚠️ 确定要无情驳回该项目吗？")) return;
    
    try {
        let response = await fetch(`${SERVER_URL}/reject-project`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: projectId })
        });
        
        let result = await response.json();
        if(result.success) {
            alert("🚫 项目已被驳回。");
            loadPendingProjects(); // 刷新表格，该项目会从 pending 列表中消失
        }
    } catch (error) {
        console.error("驳回请求失败:", error);
    }
};

// ==========================================
// Admin：用户管理 (Tab切换逻辑)
// ==========================================
window.switchUserTab = function(tab) {
    if (tab === 'pending') {
        document.getElementById('panel-pending-users').style.display = 'block';
        document.getElementById('panel-all-users').style.display = 'none';
        document.getElementById('tab-pending-users').style.background = '#5640fa';
        document.getElementById('tab-pending-users').style.color = 'white';
        document.getElementById('tab-all-users').style.background = '#f4f7fe';
        document.getElementById('tab-all-users').style.color = '#2b3674';
        loadPendingUsers(); // 🔴 切换时拉取待审核数据
    } else {
        document.getElementById('panel-pending-users').style.display = 'none';
        document.getElementById('panel-all-users').style.display = 'block';
        document.getElementById('tab-all-users').style.background = '#5640fa';
        document.getElementById('tab-all-users').style.color = 'white';
        document.getElementById('tab-pending-users').style.background = '#f4f7fe';
        document.getElementById('tab-pending-users').style.color = '#2b3674';
        loadAllUsers(); // 🔴 切换时拉取总览数据
    }
};

// ==========================================
// 渲染待审核用户 (加入 type="button" 终极防刷新)
// ==========================================
window.loadPendingUsers = async function() {
    try {
        let response = await fetch(`${SERVER_URL}/pending-users`);
        let pendingUsers = await response.json();
        
        let tbody = document.getElementById("userTableBody");
        if (!tbody) return; 
        tbody.innerHTML = ""; 

        if (pendingUsers.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #a3aed1; padding: 30px 0;">🎉 目前没有需要审核的用户</td></tr>`;
            return;
        }

        pendingUsers.forEach((u) => {
            let row = `<tr>
                <td><strong>${u.username}</strong></td>
                <td style="text-transform: capitalize;">${u.role}</td>
                <td><span style="background: #fff0d4; color: #ff9800; padding: 5px 10px; border-radius: 8px; font-size: 13px;">Pending</span></td>
                <td>
                    <!-- 🔴 重点加上 type="button" -->
                    <button type="button" class="primary-btn" onclick="approveUser(${u.id})" style="padding: 6px 12px; font-size: 13px; background-color: #28a745; margin-right: 5px;">Approve</button>
                    
                    <!-- 🔴 重点加上 type="button" -->
                    <button type="button" class="primary-btn" onclick="rejectUser(${u.id})" style="padding: 6px 12px; font-size: 13px; background-color: #dc3545;">Reject</button>
                </td>
            </tr>`;
            tbody.innerHTML += row;
        });
    } catch (error) { console.error(error); }
};

// ==========================================
// 审批/驳回用户 (局部刷新，绝不跳出)
// ==========================================
window.approveUser = async function(userId) {
    try {
        let response = await fetch(`${SERVER_URL}/approve-user`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: userId })
        });
        
        if((await response.json()).success) {
            alert("✅ 用户已批准！");
            loadPendingUsers(); // 🔴 原地刷新当前表格，绝对不跳转页面！
        }
    } catch (error) { console.error(error); }
};

window.rejectUser = async function(userId) {
    if(!confirm("⚠️ 确定要驳回该用户的申请吗？")) return;
    try {
        let response = await fetch(`${SERVER_URL}/reject-user`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: userId })
        });
        
        if((await response.json()).success) {
            alert("🚫 用户已被驳回。");
            loadPendingUsers(); // 🔴 原地刷新当前表格
        }
    } catch (error) { console.error(error); }
};

// ==========================================
// Admin：面板 B - 全局数据与过滤器 (Filter)
// ==========================================
let allUsersData = []; // 缓存在前端的数据池

window.loadAllUsers = async function() {
    try {
        let response = await fetch(`${SERVER_URL}/all-users`);
        allUsersData = await response.json();
        
        // 🔴 加上这句！它会在浏览器的控制台里打印出所有的原始数据
        console.log("🔥 后端传来的用户数据: ", allUsersData); 
        
        applyUserFilters();
    } catch (error) { console.error(error); }
};

window.applyUserFilters = function() {
    const roleFilter = document.getElementById('filterRole').value;
    const statusFilter = document.getElementById('filterStatus').value;
    const startDate = document.getElementById('userDateStart').value;
    const endDate = document.getElementById('userDateEnd').value;

    let filtered = allUsersData.filter(u => {
        let matchRole = (roleFilter === 'all') || (u.role === roleFilter);
        let matchStatus = (statusFilter === 'all') || (u.status === statusFilter);
        
        // 日期比对逻辑
        let matchDate = true;
        if (u.createdAt) {
            let rowDate = u.createdAt.split(' ')[0]; // 从 "YYYY-MM-DD HH:MM:SS" 中提取日期
            if (startDate && rowDate < startDate) matchDate = false;
            if (endDate && rowDate > endDate) matchDate = false;
        } else {
            if (startDate || endDate) matchDate = false; // 旧数据没有日期，如有过滤则不显示
        }
        
        return matchRole && matchStatus && matchDate;
    });

    let tbody = document.getElementById("allUserTableBody");
    tbody.innerHTML = ""; 

    filtered.forEach((u) => {
        let statusColor = u.status === 'approved' ? '#28a745' : (u.status === 'rejected' ? '#dc3545' : '#ff9800');
        let statusBg = u.status === 'approved' ? '#e6f4ea' : (u.status === 'rejected' ? '#fce8e6' : '#fff0d4');
        let displayDate = u.createdAt ? u.createdAt.split(' ')[0] : 'N/A';
        
        let actionHtml = u.status === 'rejected' 
            ? `<button class="primary-btn" onclick="deleteUser(${u.id})" style="padding: 4px 10px; font-size: 12px; background-color: #6c757d;">Delete</button>` 
            : `<span style="color: #ccc;">-</span>`;

        let row = `<tr>
            <td style="color: #a3aed1; font-size: 13px;">${displayDate}</td>
            <td><strong>${u.username}</strong></td>
            <td style="text-transform: capitalize;">${u.role}</td>
            <td><span style="background: ${statusBg}; color: ${statusColor}; padding: 5px 10px; border-radius: 8px; font-size: 13px; text-transform: capitalize;">${u.status}</span></td>
            <td>${actionHtml}</td>
        </tr>`;
        tbody.innerHTML += row;
    });
};

// ==========================================
// Admin：物理注销用户
// ==========================================
window.deleteUser = async function(userId) {
    if(!confirm("⚠️ 确定要彻底注销该账号吗？注销后，任何人都可以重新使用这个 Username 进行注册。")) return;
    
    try {
        let response = await fetch(`${SERVER_URL}/delete-user`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: userId })
        });
        
        let result = await response.json();
        
        if(result.success) { 
            alert("🗑️ 账号已注销！该 Username 现在自由了。"); 
            loadAllUsers(); // 瞬间刷新表格
        } else {
            alert("❌ 注销失败：" + result.message);
        }
    } catch (error) { 
        console.error("注销请求报错:", error);
        alert("🚨 请求失败！请检查你的 VS Code 终端：\n1. 是否已经按 Ctrl+C 停止了旧的服务器？\n2. 是否已经重新输入 node server.js 启动了最新的代码？"); 
    }
};

// ==========================================
// Admin Dashboard 真实数据抓取与图表渲染
// ==========================================
let dashChartQueue = null; // 用来存储甜甜圈图的实例，防止重复创建报错

window.loadAdminDashboard = async function() {
    try {
        let response = await fetch(`${SERVER_URL}/admin-stats`);
        let stats = await response.json();
        
        if (stats.success) {
            // 1. 注入文本数字
            document.getElementById('dash-minted').innerText = stats.totalMinted.toLocaleString();
            document.getElementById('dash-circulating').innerText = stats.totalMinted.toLocaleString(); // 销毁功能做完前，流通=总发行
            document.getElementById('dash-pending-proj').innerText = stats.pendingProjects + " 个";
            document.getElementById('dash-pending-users').innerText = stats.pendingUsers + " 个";
            document.getElementById('dash-rejections').innerText = stats.totalRejections + " 次";
            
            // 2. 计算供需比和进度条
            let dCount = stats.devCount;
            let bCount = stats.buyerCount;
            let totalActive = dCount + bCount;
            
            let ratioText = bCount === 0 ? `${dCount} : 0` : `${(dCount/bCount).toFixed(2)} : 1`;
            document.getElementById('dash-ratio').innerText = ratioText;
            
            if (totalActive > 0) {
                let dPercent = Math.round((dCount / totalActive) * 100);
                document.getElementById('bar-dev').style.width = dPercent + '%';
                document.getElementById('bar-buyer').style.width = (100 - dPercent) + '%';
            }

            // 3. 动态渲染甜甜圈图表 (队列比例)
            const ctxQueue = document.getElementById('queueChart');
            if (ctxQueue) {
                // 如果图表已经存在，先销毁它，不然画笔会重叠打架
                if (dashChartQueue) dashChartQueue.destroy(); 
                
                dashChartQueue = new Chart(ctxQueue, {
                    type: 'doughnut',
                    data: {
                        labels: ['项目审批', '用户审批'],
                        datasets: [{ 
                            data: [stats.pendingProjects, stats.pendingUsers], // 🔴 真实的动态数据！
                            backgroundColor: ['#4318ff', '#ff9800'], 
                            borderWidth: 0 
                        }]
                    },
                    options: { responsive: true, maintainAspectRatio: false, cutout: '75%', plugins: { legend: { display: false } } }
                });
            }
        }
    } catch (error) {
        console.error("加载真实 Dashboard 数据失败:", error);
    }
};

// ==========================================
// Admin Dashboard Tab 切换逻辑
// ==========================================
window.switchDashTab = function(tabName) {
    // 1. 隐藏所有 Dashboard 模块
    document.getElementById('dash-section-market').style.display = 'none';
    document.getElementById('dash-section-queue').style.display = 'none';
    document.getElementById('dash-section-eco').style.display = 'none';
    
    // 2. 移除所有按钮的 active 状态 (变成浅色)
    document.getElementById('dash-btn-market').classList.remove('active');
    document.getElementById('dash-btn-queue').classList.remove('active');
    document.getElementById('dash-btn-eco').classList.remove('active');
    
    // 3. 显示被点击的模块，并让对应按钮变成深紫色 active 状态
    document.getElementById(`dash-section-${tabName}`).style.display = 'block';
    document.getElementById(`dash-btn-${tabName}`).classList.add('active');
};

// ==========================================
// Profile Modal (个人信息弹窗) 终极逻辑
// ==========================================
window.openProfileModal = async function() {
    document.getElementById('profileModal').classList.add('show');
    
    // 获取当前登录的真实用户
    const currentUser = localStorage.getItem('loggedInUser'); 

    // 🔴 防呆保护：如果没有真实登录，提示去登录
    if (!currentUser) {
        document.getElementById('prof-val-user').innerText = "⚠️ 请使用真实账号登录";
        document.getElementById('prof-val-role').innerText = "-";
        document.getElementById('prof-val-status').innerText = "-";
        document.getElementById('prof-val-date').innerText = "-";
        return;
    }

    try {
        // 🔴 加了时间戳 (?t=...) 强行绕过浏览器缓存，保证每次拿到的都是最新资料
        let response = await fetch(`${SERVER_URL}/user-profile?username=${currentUser}&t=${new Date().getTime()}`);
        let result = await response.json();

        if (result.success) {
            let u = result.data;
            
            // 注入左侧只读名片
            document.getElementById('prof-val-user').innerText = u.username;
            document.getElementById('prof-val-role').innerText = u.role || 'Not Set';
            document.getElementById('prof-val-email').innerText = u.email || 'Not Set';
            document.getElementById('prof-val-phone').innerText = u.phone || 'Not Set';
            document.getElementById('prof-val-status').innerText = u.status;
            document.getElementById('prof-val-date').innerText = u.createdAt ? u.createdAt : 'N/A';
            
            // 状态颜色逻辑
            let statusEl = document.getElementById('prof-val-status');
            if (u.status === 'approved') {
                statusEl.style.background = '#e6f4ea'; statusEl.style.color = '#28a745';
            } else if (u.status === 'rejected') {
                statusEl.style.background = '#fce8e6'; statusEl.style.color = '#dc3545';
            } else {
                statusEl.style.background = '#fff0d4'; statusEl.style.color = '#ff9800';
            }

            // 注入右侧表单数据
            document.getElementById('prof-input-email').value = u.email || '';
            document.getElementById('prof-input-phone').value = u.phone || '';

            // 读取本地头像
            const savedAvatar = localStorage.getItem(`avatar_${u.username}`);
            if (savedAvatar) {
                document.getElementById('avatarIcon').style.display = 'none';
                document.getElementById('avatarPreview').style.backgroundImage = `url(${savedAvatar})`;
            } else {
                document.getElementById('avatarIcon').style.display = 'block';
                document.getElementById('avatarPreview').style.backgroundImage = 'none';
            }
            
        } else {
            document.getElementById('prof-val-user').innerText = "⚠️ 找不到该账号";
        }
    } catch (error) { 
        console.error("Profile fetch error:", error); 
        document.getElementById('prof-val-user').innerText = "🚨 网络请求失败";
    }
};

window.closeProfileModal = function() {
    document.getElementById('profileModal').classList.remove('show');
};

// ==========================================
// 退出登录逻辑 (彻底重置版)
// ==========================================
window.handleLogout = function() {
    if(confirm("⚠️ 确定要退出登录吗？")) {
        // 1. 彻底清除本地缓存里的账号记忆
        localStorage.removeItem('loggedInUser');
        if (typeof closeProfileModal === 'function') closeProfileModal();
        
        // 2. 🔴 终极大招：强制刷新当前网页
        // 刷新后，系统检测不到缓存，会自动将所有 UI 和状态完美重置回最初的 Login 界面
        window.location.reload();
    }
};

// 主菜单切换
window.switchProfTab = function(tab) {
    document.getElementById('ptab-settings').classList.remove('active');
    document.getElementById('ptab-prefs').classList.remove('active');
    document.getElementById('pcontent-settings').style.display = 'none';
    document.getElementById('pcontent-prefs').style.display = 'none';

    document.getElementById(`ptab-${tab}`).classList.add('active');
    document.getElementById(`pcontent-${tab}`).style.display = 'block';
};

// 子菜单切换
window.switchSubTab = function(tab) {
    document.getElementById('subtab-profile').classList.remove('active');
    document.getElementById('subtab-security').classList.remove('active');
    document.getElementById('subcontent-profile').style.display = 'none';
    document.getElementById('subcontent-security').style.display = 'none';

    document.getElementById(`subtab-${tab}`).classList.add('active');
    document.getElementById(`subcontent-${tab}`).style.display = 'block';
};

// 🔴 真实保存普通资料与新头像
window.handleUpdateProfile = async function() {
    let email = document.getElementById('prof-input-email').value;
    let phone = document.getElementById('prof-input-phone').value;
    const currentUser = localStorage.getItem('loggedInUser'); 

    if (!currentUser) {
        alert("❌ 请先正常登录系统！");
        return;
    }

    try {
        // 1. 发送真实数据给后端保存
        let response = await fetch(`${SERVER_URL}/update-profile`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: currentUser, email: email, phone: phone })
        });
        
        let result = await response.json();

        if (result.success) {
            // 2. 如果后端保存成功，再保存头像到本地
            if (window.pendingAvatarUpdate) {
                localStorage.setItem(`avatar_${currentUser}`, window.pendingAvatarUpdate);
                window.pendingAvatarUpdate = null; 
            }
            syncGlobalAvatar(); 

            alert("✅ 资料保存成功！");
            
            // 3. 刷新弹窗，让你立刻看到左侧名片更新
            closeProfileModal();
            setTimeout(() => openProfileModal(), 300);
        } else {
            // 如果邮箱/电话和别人撞了，这里会弹窗报错
            alert("❌ " + result.message); 
        }
    } catch (error) {
        console.error(error);
        alert("🚨 网络请求失败，请检查后端是否运行。");
    }
};

// ==========================================
// 独立修改密码逻辑 (防呆与直接修改)
// ==========================================
window.handleUpdatePassword = async function() {
    let oldPass = document.getElementById('prof-input-oldpass').value;
    let newPass = document.getElementById('prof-input-newpass').value;
    let confPass = document.getElementById('prof-input-confpass').value;
    const currentUser = localStorage.getItem('loggedInUser');

    // 1. 基础防呆拦截
    if (!currentUser) return;
    if (!oldPass || !newPass || !confPass) {
        alert("🚨 请将三个密码框填写完整！");
        return;
    }
    if (newPass !== confPass) {
        alert("🚨 两次输入的新密码不一致，请重新输入！");
        return;
    }

    // 2. 发送给专属换密码接口
    try {
        let response = await fetch(`${SERVER_URL}/update-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: currentUser,
                oldPassword: oldPass,
                newPassword: newPass
            })
        });

        let result = await response.json();

        if (result.success) {
            alert("✅ 密码修改成功！下次登录请使用新密码。");
            
            // 修改成功后，把三个输入框清空，假装什么都没发生
            document.getElementById('prof-input-oldpass').value = "";
            document.getElementById('prof-input-newpass').value = "";
            document.getElementById('prof-input-confpass').value = "";
        } else {
            // 如果旧密码填错了，后端会在这里拦截
            alert(result.message);
        }
    } catch (error) {
        console.error(error);
        alert("🚨 网络请求失败，请检查后端运行状态。");
    }
};
// 🔴 处理头像上传与即时预览
window.previewAvatar = function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const avatarBase64 = e.target.result;
            // 隐藏默认的 👤 图标，设置背景图
            document.getElementById('avatarIcon').style.display = 'none';
            document.getElementById('avatarPreview').style.backgroundImage = `url(${avatarBase64})`;
            
            // 把图片数据暂存到全局变量，等待用户点击 Update Profile 保存
            window.pendingAvatarUpdate = avatarBase64;
        };
        reader.readAsDataURL(file); // 将图片转为 Base64
    }
};

// ==========================================
// 全局头像同步逻辑
// ==========================================
window.syncGlobalAvatar = function() {
    const currentUser = localStorage.getItem('loggedInUser');
    const globalBtn = document.getElementById('globalAvatarBtn');
    const globalIcon = document.getElementById('globalAvatarIcon');
    
    if (!globalBtn || !globalIcon) return;

    if (currentUser) {
        // 去缓存里找当前用户的专属头像
        const savedAvatar = localStorage.getItem(`avatar_${currentUser}`);
        if (savedAvatar) {
            globalBtn.style.backgroundImage = `url(${savedAvatar})`;
            globalIcon.style.display = 'none'; // 隐藏默认的文字小人
            return;
        }
    }
    
    // 如果没找到照片，或者没登录，恢复默认小人
    globalBtn.style.backgroundImage = 'none';
    globalIcon.style.display = 'block';
};

// 页面一加载就偷偷执行一次，防止刷新后头像掉线
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(syncGlobalAvatar, 500);
});

// ==========================================
// 侧边栏折叠与展开逻辑
// ==========================================
window.toggleSidebar = function() {
    const sidebar = document.getElementById('mainSidebar');
    const mainContent = document.getElementById('mainContent');
    const headerBtn = document.getElementById('headerSidebarBtn');

    // 切换折叠状态的 CSS class
    sidebar.classList.toggle('collapsed');
    mainContent.classList.toggle('expanded');

    // 如果侧边栏被收起了，就在左上角显示出那个小按钮
    if (sidebar.classList.contains('collapsed')) {
        headerBtn.style.display = 'block';
    } else {
        headerBtn.style.display = 'none';
    }
};