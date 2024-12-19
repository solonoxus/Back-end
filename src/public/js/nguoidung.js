var currentUser;
var tongTienTatCaDonHang = 0;
var tongSanPhamTatCaDonHang = 0;

window.onload = async function () {
    await khoiTao();

    // autocomplete cho khung tim kiem
    const response = await callApi(ENDPOINTS.PRODUCTS);
    const products = response.data;
    autocomplete(document.getElementById('search-box'), products);

    // thêm tags (từ khóa) vào khung tìm kiếm
    const tags = ["Samsung", "IPhone", "Vivo", "Oppo", "Xiaomi"];
    for (const t of tags) {
        addTags(t, "index.html?search=" + t);
    }

    const token = localStorage.getItem('token');
    if (token) {
        try {
            const userResponse = await callApi(ENDPOINTS.CURRENT_USER);
            currentUser = userResponse.data;
            await addTatCaDonHang(currentUser);
            addInfoUser(currentUser);
        } catch (error) {
            console.error('Lỗi lấy thông tin user:', error);
            localStorage.removeItem('token');
            document.getElementsByClassName('infoUser')[0].innerHTML = `
                <h2 style="color: red; font-weight:bold; text-align:center; font-size: 2em; padding: 50px;">
                    Bạn chưa đăng nhập !!
                </h2>`;
        }
    } else {
        document.getElementsByClassName('infoUser')[0].innerHTML = `
            <h2 style="color: red; font-weight:bold; text-align:center; font-size: 2em; padding: 50px;">
                Bạn chưa đăng nhập !!
            </h2>`;
    }
}

// Phần Thông tin người dùng
function addInfoUser(user) {
    if (!user) return;
    document.getElementsByClassName('infoUser')[0].innerHTML = `
    <hr>
    <table>
        <tr>
            <th colspan="3">THÔNG TIN KHÁCH HÀNG</th>
        </tr>
        <tr>
            <td>Tài khoản: </td>
            <td> <input type="text" value="` + user.username + `" readonly> </td>
            <td> <i class="fa fa-pencil" onclick="changeInfo(this, 'username')"></i> </td>
        </tr>
        <tr>
            <td>Mật khẩu: </td>
            <td style="text-align: center;"> 
                <i class="fa fa-pencil" id="butDoiMatKhau" onclick="openChangePass()"> Đổi mật khẩu</i> 
            </td>
            <td></td>
        </tr>
        <tr>
            <td colspan="3" id="khungDoiMatKhau">
                <table>
                    <tr>
                        <td> <div>Mật khẩu cũ:</div> </td>
                        <td> <div><input type="password"></div> </td>
                    </tr>
                    <tr>
                        <td> <div>Mật khẩu mới:</div> </td>
                        <td> <div><input type="password"></div> </td>
                    </tr>
                    <tr>
                        <td> <div>Xác nhận mật khẩu:</div> </td>
                        <td> <div><input type="password"></div> </td>
                    </tr>
                    <tr>
                        <td></td>
                        <td> 
                            <div><button onclick="changePass()">Đồng ý</button></div> 
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td>Họ: </td>
            <td> <input type="text" value="` + user.ho + `" readonly> </td>
            <td> <i class="fa fa-pencil" onclick="changeInfo(this, 'ho')"></i> </td>
        </tr>
        <tr>
            <td>Tên: </td>
            <td> <input type="text" value="` + user.ten + `" readonly> </td>
            <td> <i class="fa fa-pencil" onclick="changeInfo(this, 'ten')"></i> </td>
        </tr>
        <tr>
            <td>Email: </td>
            <td> <input type="text" value="` + user.email + `" readonly> </td>
            <td> <i class="fa fa-pencil" onclick="changeInfo(this, 'email')"></i> </td>
        </tr>
        <tr>
            <td colspan="3" style="padding:5px; border-top: 2px solid #ccc;"></td>
        </tr>
        <tr>
            <td>Tổng tiền đã mua: </td>
            <td> <input type="text" value="` + numToString(tongTienTatCaDonHang) + `₫" readonly> </td>
            <td></td>
        </tr>
        <tr>
            <td>Số lượng sản phẩm đã mua: </td>
            <td> <input type="text" value="` + tongSanPhamTatCaDonHang + `" readonly> </td>
            <td></td>
        </tr>
    </table>`;
}

function openChangePass() {
    var khungChangePass = document.getElementById('khungDoiMatKhau');
    var actived = khungChangePass.classList.contains('active');
    if (actived) khungChangePass.classList.remove('active');
    else khungChangePass.classList.add('active');
}

async function changePass() {
    const khungChangePass = document.getElementById('khungDoiMatKhau');
    const inps = khungChangePass.getElementsByTagName('input');
    const oldPass = inps[0].value;
    const newPass = inps[1].value;
    const confirmPass = inps[2].value;

    if (!oldPass) {
        alert('Chưa nhập mật khẩu cũ !');
        inps[0].focus();
        return;
    }
    if (!newPass) {
        alert('Chưa nhập mật khẩu mới !');
        inps[1].focus();
        return;
    }
    if (newPass != confirmPass) {
        alert('Mật khẩu không khớp !');
        inps[2].focus();
        return;
    }

    try {
        await callApi('/api/users/change-password', 'PUT', {
            oldPassword: oldPass,
            newPassword: newPass
        });

        addAlertBox('Thay đổi mật khẩu thành công.', '#5f5', '#000', 4000);
        openChangePass();
        
        // Reset form
        inps[0].value = '';
        inps[1].value = '';
        inps[2].value = '';
    } catch (error) {
        console.error('Lỗi đổi mật khẩu:', error);
        addAlertBox('Mật khẩu cũ không đúng.', '#f55', '#000', 3000);
        inps[0].focus();
    }
}

async function changeInfo(iTag, info) {
    const inp = iTag.parentElement.previousElementSibling.getElementsByTagName('input')[0];

    // Đang hiện
    if (!inp.readOnly && inp.value != '') {
        const newValue = inp.value.trim();

        try {
            await callApi('/api/users/profile', 'PUT', {
                [info]: newValue
            });

            // Cập nhật currentUser
            currentUser[info] = newValue;

            // Cập nhật giao diện
            if (info == 'username' && !currentUser.donhang?.length) {
                document.getElementsByClassName('listDonHang')[0].innerHTML = `
                    <h3 style="width=100%; padding: 50px; color: green; font-size: 2em; text-align: center"> 
                        Xin chào ${newValue}. Bạn chưa có đơn hàng nào.
                    </h3>`;
            }

            // Cập nhật header
            capNhat_ThongTin_CurrentUser();

            iTag.innerHTML = '';
            inp.readOnly = true;

        } catch (error) {
            console.error('Lỗi cập nhật thông tin:', error);
            if (error.response?.status === 409) {
                alert(`${info === 'username' ? 'Tên đăng nhập' : 'Email'} đã có người sử dụng!`);
                inp.value = currentUser[info];
            } else {
                addAlertBox('Có lỗi xảy ra khi cập nhật thông tin.', '#f55', '#000', 3000);
            }
        }
    } else {
        inp.readOnly = false;
        iTag.innerHTML = 'Đồng ý';
        inp.focus();
    }
}


// Phần thông tin đơn hàng
async function addTatCaDonHang(user) {
    if (!user) return;

    try {
        const response = await callApi('/api/orders');
        const orders = response.data;

        if (!orders.length) {
            document.getElementsByClassName('listDonHang')[0].innerHTML = `
                <h3 style="width=100%; padding: 50px; color: green; font-size: 2em; text-align: center"> 
                    Xin chào ${user.username}. Bạn chưa có đơn hàng nào.
                </h3>`;
            return;
        }

        // Thêm từng đơn hàng vào danh sách
        for (const order of orders) {
            await addDonHang(order);
            // Tính tổng tiền và số lượng
            tongTienTatCaDonHang += order.total;
            tongSanPhamTatCaDonHang += order.items.reduce((sum, item) => sum + item.quantity, 0);
        }
    } catch (error) {
        console.error('Lỗi lấy danh sách đơn hàng:', error);
        addAlertBox('Có lỗi xảy ra khi tải đơn hàng.', '#f55', '#000', 3000);
    }
}

function addDonHang(dh) {
    const div = document.getElementsByClassName('listDonHang')[0];

    const newDiv = document.createElement('div');
    newDiv.classList.add('donhang');
    
    const productList = dh.items.map(item => `
        <div class="sanpham">
            <img src="${item.product.img}" alt="">
            <div class="thongtin">
                <a href="chitietsanpham.html?code=${item.product._id}" title="Xem chi tiết">${item.product.name}</a>
                <div class="dongia">Đơn giá: ${numToString(item.product.price)}₫</div>
                <div class="soluong">Số lượng: ${item.quantity}</div>
                <div class="thanhtien">Thành tiền: ${numToString(item.product.price * item.quantity)}₫</div>
            </div>
        </div>
    `).join('');

    newDiv.innerHTML = `
        <div class="header">
            <div class="date">Ngày: ${new Date(dh.createdAt).toLocaleDateString('vi-VN')}</div>
            <div class="trangThai">
                ${getTrangThaiDonHang(dh.status)}
            </div>
        </div>
        <div class="chitietdonhang">
            ${productList}
        </div>
        <div class="footer">
            <div class="tongtien">Tổng tiền: ${numToString(dh.total)}₫</div>
        </div>
    `;
    
    div.appendChild(newDiv);
}
function getTrangThaiDonHang(status) {
    switch (status) {
        case 'pending': return 'Đang chờ xử lý';
        case 'processing': return 'Đang xử lý';
        case 'shipping': return 'Đang giao hàng';
        case 'completed': return 'Đã giao hàng';
        case 'cancelled': return 'Đã hủy';
        default: return 'Không xác định';
    }
}
