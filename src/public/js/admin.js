const API_URL = 'http://localhost:3001/api';


// Kiểm tra token admin
async function checkAdminToken() {
    const token = localStorage.getItem('adminToken');
    if (!token) return false;
    
    try {
        const response = await fetch(`${API_URL}/admin/verify`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.ok;
    } catch (error) {
        console.error('Error verifying admin token:', error);
        return false;
    }
}

// Khởi tạo trang
window.onload = async function () {
    if (await checkAdminToken()) {
        await Promise.all([
            addTableProducts(),
            addTableDonHang(),
            addTableKhachHang(),
            addThongKe()
        ]);
        openTab('Trang Chủ');
    } else {
        document.body.innerHTML = `<h1 style="color:red; width:100%; text-align:center; margin: 50px;">Truy cập bị từ chối</h1>`;
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 2000);
    }
}

// Đăng xuất admin
function logOutAdmin() {
    localStorage.removeItem('adminToken');
    window.location.href = '/login.html';
}

// Các hàm utility giữ nguyên
function getListRandomColor(length) {
    let result = [];
    for(let i = length; i--;) {
        result.push(getRandomColor());
    }
    return result;
}

function addChart(id, chartOption) {
    var ctx = document.getElementById(id).getContext('2d');
    var chart = new Chart(ctx, chartOption);
}

function createChartConfig(
    title = 'Title',
    charType = 'bar',
    labels = ['nothing'],
    data = [2],
    colors = ['red'],
) {
    return {
        type: charType,
        data: {
            labels: labels,
            datasets: [{
                label: title,
                data: data,
                backgroundColor: colors,
                borderColor: colors,
            }]
        },
        options: {
            title: {
                fontColor: '#fff',
                fontSize: 25,
                display: true,
                text: title
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    };
}

async function addThongKe() {
    try {
        const response = await fetch(`${API_URL}/admin/statistics`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Không thể lấy dữ liệu thống kê');
        }

        const { statistics } = await response.json();
        
        // Thống kê số lượng bán ra
        addChart('myChart1', createChartConfig(
            'Số lượng bán ra',
            'bar',
            Object.keys(statistics.sales),
            Object.values(statistics.sales).map(s => s.quantity),
            getListRandomColor(Object.keys(statistics.sales).length)
        ));

        // Thống kê doanh thu
        addChart('myChart2', createChartConfig(
            'Doanh thu',
            'doughnut',
            Object.keys(statistics.revenue),
            Object.values(statistics.revenue).map(r => r.total),
            getListRandomColor(Object.keys(statistics.revenue).length)
        ));
    } catch (error) {
        console.error('Error loading statistics:', error);
        alert('Không thể tải dữ liệu thống kê');
    }
}
// ======================= Các Tab =========================
function addEventChangeTab() { 
    var sidebar = document.getElementsByClassName('sidebar')[0]; 
    var list_a = sidebar.getElementsByTagName('a'); 
    for(var a of list_a) {  
        if(!a.onclick) {
            a.addEventListener('click', function() {
                turnOff_Active();
                this.classList.add('active');
                var tab = this.childNodes[1].data.trim()
                openTab(tab);
            })
        }
    }
}

function turnOff_Active() {
    var sidebar = document.getElementsByClassName('sidebar')[0];
    var list_a = sidebar.getElementsByTagName('a');
    for(var a of list_a) {
        a.classList.remove('active');
    }
}

function openTab(nameTab) {
    // ẩn hết
    var main = document.getElementsByClassName('main')[0].children;
    for(var e of main) {
        e.style.display = 'none';
    }

    // mở tab
    switch(nameTab) {
        case 'Trang Chủ':
            document.getElementsByClassName('home')[0].style.display = 'block';
            addThongKe();
            break;
        case 'Sản Phẩm':
            document.getElementsByClassName('sanpham')[0].style.display = 'block';
            addTableProducts();
            break;
        case 'Đơn Hàng':
            document.getElementsByClassName('donhang')[0].style.display = 'block';
            addTableDonHang();
            break;
        case 'Khách Hàng':
            document.getElementsByClassName('khachhang')[0].style.display = 'block';
            addTableKhachHang();
            break;
    }
}

// ========================== Sản Phẩm ========================
// Vẽ bảng danh sách sản phẩm
async function addTableProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        if (!response.ok) throw new Error('Không thể lấy danh sách sản phẩm');
        
        const { products } = await response.json();
        
        var tc = document.getElementsByClassName('sanpham')[0].getElementsByClassName('table-content')[0];
        var s = `<table class="table-outline hideImg">`;

        for (var i = 0; i < products.length; i++) {
            var p = products[i];
            s += `<tr>
                <td style="width: 5%">` + (i+1) + `</td>
                <td style="width: 10%">` + p.code + `</td>
                <td style="width: 40%">
                    <a title="Xem chi tiết" target="_blank" href="chitietsanpham.html?` + p.name.split(' ').join('-') + `">` + p.name + `</a>
                    <img src="` + p.image + `"></img>
                </td>
                <td style="width: 15%">` + p.price.toLocaleString('vi-VN') + `đ</td>
                <td style="width: 15%">` + p.category + `</td>
                <td style="width: 15%">
                    <div class="tooltip">
                        <i class="fa fa-wrench" onclick="addKhungSuaSanPham('` + p._id + `')"></i>
                        <span class="tooltiptext">Sửa</span>
                    </div>
                    <div class="tooltip">
                        <i class="fa fa-trash" onclick="xoaSanPham('` + p._id + `', '`+p.name+`')"></i>
                        <span class="tooltiptext">Xóa</span>
                    </div>
                </td>
            </tr>`;
        }

        s += `</table>`;
        tc.innerHTML = s;
    } catch (error) {
        console.error('Error loading products:', error);
        alert('Không thể tải danh sách sản phẩm');
    }
}
// Tìm kiếm
async function timKiemSanPham(inp) {
    var filter = inp.value.toUpperCase();
    if (!filter) {
        addTableProducts();
        return;
    }

    try {
        const response = await fetch(`${API_URL}/products/search?q=${filter}`);
        if (!response.ok) throw new Error('Không thể tìm kiếm sản phẩm');
        
        const { products } = await response.json();
        
        var tc = document.getElementsByClassName('sanpham')[0].getElementsByClassName('table-content')[0];
        var s = `<table class="table-outline hideImg">`;

        for (var i = 0; i < products.length; i++) {
            var p = products[i];
            s += `<tr>
                <td style="width: 5%">` + (i+1) + `</td>
                <td style="width: 10%">` + p.code + `</td>
                <td style="width: 40%">
                    <a title="Xem chi tiết" target="_blank" href="chitietsanpham.html?` + p.name.split(' ').join('-') + `">` + p.name + `</a>
                    <img src="` + p.image + `"></img>
                </td>
                <td style="width: 15%">` + p.price.toLocaleString('vi-VN') + `đ</td>
                <td style="width: 15%">` + p.category + `</td>
                <td style="width: 15%">
                    <div class="tooltip">
                        <i class="fa fa-wrench" onclick="addKhungSuaSanPham('` + p._id + `')"></i>
                        <span class="tooltiptext">Sửa</span>
                    </div>
                    <div class="tooltip">
                        <i class="fa fa-trash" onclick="xoaSanPham('` + p._id + `', '`+p.name+`')"></i>
                        <span class="tooltiptext">Xóa</span>
                    </div>
                </td>
            </tr>`;
        }

        s += `</table>`;
        tc.innerHTML = s;
    } catch (error) {
        console.error('Error searching products:', error);
        alert('Lỗi khi tìm kiếm sản phẩm');
    }
}
// Thêm
let previewSrc; // biến toàn cục lưu file ảnh đang thêm
function layThongTinSanPhamTuTable(id) {
    var khung = document.getElementById(id);
    var tr = khung.getElementsByTagName('tr');

    var masp = tr[1].getElementsByTagName('td')[1].getElementsByTagName('input')[0].value;
    var name = tr[2].getElementsByTagName('td')[1].getElementsByTagName('input')[0].value;
    var company = tr[3].getElementsByTagName('td')[1].getElementsByTagName('select')[0].value;
    var img = tr[4].getElementsByTagName('td')[1].getElementsByTagName('img')[0].src;
    var price = tr[5].getElementsByTagName('td')[1].getElementsByTagName('input')[0].value;
    var star = tr[6].getElementsByTagName('td')[1].getElementsByTagName('input')[0].value;
    var rateCount = tr[7].getElementsByTagName('td')[1].getElementsByTagName('input')[0].value;
    var promoName = tr[8].getElementsByTagName('td')[1].getElementsByTagName('select')[0].value;
    var promoValue = tr[9].getElementsByTagName('td')[1].getElementsByTagName('input')[0].value;

    var screen = tr[11].getElementsByTagName('td')[1].getElementsByTagName('input')[0].value;
    var os = tr[12].getElementsByTagName('td')[1].getElementsByTagName('input')[0].value;
    var camara = tr[13].getElementsByTagName('td')[1].getElementsByTagName('input')[0].value;
    var camaraFront = tr[14].getElementsByTagName('td')[1].getElementsByTagName('input')[0].value;
    var cpu = tr[15].getElementsByTagName('td')[1].getElementsByTagName('input')[0].value;
    var ram = tr[16].getElementsByTagName('td')[1].getElementsByTagName('input')[0].value;
    var rom = tr[17].getElementsByTagName('td')[1].getElementsByTagName('input')[0].value;
    var microUSB = tr[18].getElementsByTagName('td')[1].getElementsByTagName('input')[0].value;
    var battery = tr[19].getElementsByTagName('td')[1].getElementsByTagName('input')[0].value;

    if(isNaN(price)) { // isNaN là hàm kiểm tra xem có phải là số không 
        alert('Giá phải là số nguyên');
        return false;
    }

    if(isNaN(star)) {
        alert('Số sao phải là số nguyên');
        return false;
    }

    if(isNaN(rateCount)) {
        alert('Số đánh giá phải là số nguyên');
        return false;
    }

    try {
        return {
            "name": name,
            "company": company,
            "img": previewSrc,
            "price": numToString(Number.parseInt(price, 10)),
            "star": Number.parseInt(star, 10),
            "rateCount": Number.parseInt(rateCount, 10),
            "promo": {
                "name": promoName,
                "value": promoValue
            },
            "detail": {
                "screen": screen,
                "os": os,
                "camara": camara,
                "camaraFront": camaraFront,
                "cpu": cpu,
                "ram": ram,
                "rom": rom,
                "microUSB": microUSB,
                "battery": battery
            },
            "masp" : masp
        }
    } catch(e) {
        alert('Lỗi: ' + e.toString());
        return false;
    }
}
async function themSanPham() {
    try {
        const form = document.getElementById('khungThemSanPham');
        const formData = new FormData(form);
        
        const response = await fetch(`${API_URL}/admin/products`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: formData
        });

        if (!response.ok) throw new Error('Không thể thêm sản phẩm');
        
        alert('Thêm sản phẩm thành công');
        document.getElementById('khungThemSanPham').style.transform = 'scale(0)';
        addTableProducts();
    } catch (error) {
        console.error('Error adding product:', error);
        alert('Lỗi khi thêm sản phẩm');
    }
}

function autoMaSanPham(company) {
    // hàm tự tạo mã cho sản phẩm mới
    if(!company) company = document.getElementsByName('chonCompany')[0].value;
    var index = 0;
    for (var i = 0; i < list_products.length; i++) {
        if (list_products[i].company == company) {
            index++;
        }
    }
    document.getElementById('maspThem').value = company.substring(0, 3) + index;
}

async function xoaSanPham(id, name) {
    if (confirm('Bạn có chắc muốn xóa ' + name)) {
        try {
            const response = await fetch(`${API_URL}/admin/products/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });

            if (!response.ok) throw new Error('Không thể xóa sản phẩm');
            
            alert('Xóa sản phẩm thành công');
            addTableProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Lỗi khi xóa sản phẩm');
        }
    }
}
// Sửa
async function suaSanPham(id) {
    try {
        const form = document.getElementById('formSuaSanPham');
        const formData = new FormData(form);
        
        const response = await fetch(`${API_URL}/admin/products/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: formData
        });

        if (!response.ok) throw new Error('Không thể cập nhật sản phẩm');
        
        alert('Cập nhật sản phẩm thành công');
        document.getElementById('khungSuaSanPham').style.transform = 'scale(0)';
        addTableProducts();
    } catch (error) {
        console.error('Error updating product:', error);
        alert('Lỗi khi cập nhật sản phẩm');
    }
}

function addKhungSuaSanPham(masp) {
    var sp;
    for(var p of list_products) {
        if(p.masp == masp) {
            sp = p;
        }
    }

    var s = `<span class="close" onclick="this.parentElement.style.transform = 'scale(0)';">&times;</span>
    <table class="overlayTable table-outline table-content table-header">
        <tr>
            <th colspan="2">`+sp.name+`</th>
        </tr>
        <tr>
            <td>Mã sản phẩm:</td>
            <td><input type="text" value="`+sp.masp+`"></td>
        </tr>
        <tr>
            <td>Tên sẩn phẩm:</td>
            <td><input type="text" value="`+sp.name+`"></td>
        </tr>
        <tr>
            <td>Hãng:</td>
            <td>
                <select>`
                    
    var company = ["Apple", "Samsung","Oppo" , "Vivo", "Xiaomi"]; //đây là danh sách các hãng điện thoại để chọn trong thẻ select phục vụ cho việc sửa sản phẩm
    for(var c of company) { 
        if(sp.company == c)
            s += (`<option value="`+c+`" selected>`+c+`</option>`);
        else s += (`<option value="`+c+`">`+c+`</option>`);
    }

    s += `
                </select>
            </td>
        </tr>
        <tr>
            <td>Hình:</td>
            <td>
                <img class="hinhDaiDien" id="anhDaiDienSanPhamSua" src="`+sp.img+`">
                <input type="file" accept="image/*" onchange="capNhatAnhSanPham(this.files, 'anhDaiDienSanPhamSua')">
            </td>
        </tr>
        <tr>
            <td>Giá tiền (số nguyên):</td>
            <td><input type="text" value="`+stringToNum(sp.price)+`"></td>
        </tr>
        <tr>
            <td>Số sao (số nguyên 0->5):</td>
            <td><input type="text" value="`+sp.star+`"></td>
        </tr>
        <tr>
            <td>Đánh giá (số nguyên):</td>
            <td><input type="text" value="`+sp.rateCount+`"></td>
        </tr>
        <tr>
            <td>Khuyến mãi:</td>
            <td>
                <select>
                    <option value="">Không</option>
                    <option value="tragop" `+(sp.promo.name == 'tragop'?'selected':'')+`>Trả góp</option>
                    <option value="giamgia" `+(sp.promo.name == 'giamgia'?'selected':'')+`>Giảm giá</option>
                    <option value="giareonline" `+(sp.promo.name == 'giareonline'?'selected':'')+`>Giá rẻ online</option>
                    <option value="moiramat" `+(sp.promo.name == 'moiramat'?'selected':'')+`>Mới ra mắt</option>
                    <option value="giarehon" `+(sp.promo.name == 'moiramat'?'selected':'')+`>Giá rẻ hơn</option>
                </select>
            </td>
        </tr>
        <tr>
            <td>Giá trị khuyến mãi:</td>
            <td><input type="text" value="`+sp.promo.value+`"></td>
        </tr>
        <tr>
            <th colspan="2">Thông số kĩ thuật</th>
        </tr>
        <tr>
            <td>Màn hình:</td>
            <td><input type="text" value="`+sp.detail.screen+`"></td>
        </tr>
        <tr>
            <td>Hệ điều hành:</td>
            <td><input type="text" value="`+sp.detail.os+`"></td>
        </tr>
        <tr>
            <td>Camara sau:</td>
            <td><input type="text" value="`+sp.detail.camara+`"></td>
        </tr>
        <tr>
            <td>Camara trước:</td>
            <td><input type="text" value="`+sp.detail.camaraFront+`"></td>
        </tr>
        <tr>
            <td>CPU:</td>
            <td><input type="text" value="`+sp.detail.cpu+`"></td>
        </tr>
        <tr>
            <td>RAM:</td>
            <td><input type="text" value="`+sp.detail.ram+`"></td>
        </tr>
        <tr>
            <td>Bộ nhớ trong:</td>
            <td><input type="text" value="`+sp.detail.rom+`"></td>
        </tr>
        <tr>
            <td>Thẻ nhớ:</td>
            <td><input type="text" value="`+sp.detail.microUSB+`"></td>
        </tr>
        <tr>
            <td>Dung lượng Pin:</td>
            <td><input type="text" value="`+sp.detail.battery+`"></td>
        </tr>
        <tr>
            <td colspan="2"  class="table-footer"> <button onclick="suaSanPham('`+sp.masp+`')">SỬA</button> </td>
        </tr>
    </table>`
    var khung = document.getElementById('khungSuaSanPham');
    khung.innerHTML = s;
    khung.style.transform = 'scale(1)';
}

// Cập nhật ảnh sản phẩm
async function capNhatAnhSanPham(files, id) {
    try {
        const formData = new FormData();
        formData.append('image', files[0]);
        
        const response = await fetch(`${API_URL}/admin/products/${id}/image`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: formData
        });

        if (!response.ok) throw new Error('Không thể cập nhật ảnh sản phẩm');
        
        alert('Cập nhật ảnh sản phẩm thành công');
        addTableProducts();
    } catch (error) {
        console.error('Error updating product image:', error);
        alert('Lỗi khi cập nhật ảnh sản phẩm');
    }
}
// Sắp Xếp sản phẩm
function sortProductsTable(loai) {
    var list = document.getElementsByClassName('sanpham')[0].getElementsByClassName("table-content")[0];
    var tr = list.getElementsByTagName('tr');

    quickSort(tr, 0, tr.length-1, loai, getValueOfTypeInTable_SanPham); // type cho phép lựa chọn sort theo mã hoặc tên hoặc giá ... 
    decrease = !decrease;
}

// Lấy giá trị của loại(cột) dữ liệu nào đó trong bảng
function getValueOfTypeInTable_SanPham(tr, loai) {
    var td = tr.getElementsByTagName('td');
    switch(loai) {
        case 'stt' : return Number(td[0].innerHTML);
        case 'masp' : return td[1].innerHTML.toLowerCase();
        case 'ten' : return td[2].innerHTML.toLowerCase();
        case 'gia' : return stringToNum(td[3].innerHTML);
        case 'khuyenmai' : return td[4].innerHTML.toLowerCase();
    }
    return false;
}

// ========================= Đơn Hàng ===========================
// Vẽ bảng

async function addTableDonHang() {
    try {
        const response = await fetch(`${API_URL}/admin/orders`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        if (!response.ok) throw new Error('Không thể lấy danh sách đơn hàng');
        
        const { orders } = await response.json();
        
        var tc = document.getElementsByClassName('donhang')[0].getElementsByClassName('table-content')[0];
        var s = `<table class="table-outline hideImg">`;

        for (var i = 0; i < orders.length; i++) {
            var d = orders[i];
            s += `<tr>
                <td style="width: 5%">` + (i+1) + `</td>
                <td style="width: 13%">` + d._id + `</td>
                <td style="width: 7%">` + d.user.username + `</td>
                <td style="width: 20%">` + d.address + `</td>
                <td style="width: 15%">` + d.phone + `</td>
                <td style="width: 10%">` + d.total.toLocaleString('vi-VN') + `đ</td>
                <td style="width: 10%">` + d.status + `</td>
                <td style="width: 10%">` + new Date(d.createdAt).toLocaleDateString('vi-VN') + `</td>
                <td style="width: 10%">
                    <div class="tooltip">
                        <i class="fa fa-check" onclick="duyetDonHang('` + d._id + `', 'approved')"></i>
                        <span class="tooltiptext">Duyệt</span>
                    </div>
                    <div class="tooltip">
                        <i class="fa fa-remove" onclick="duyetDonHang('` + d._id + `', 'cancelled')"></i>
                        <span class="tooltiptext">Hủy</span>
                    </div>
                </td>
            </tr>`;
        }

        s += `</table>`;
        tc.innerHTML = s;
    } catch (error) {
        console.error('Error loading orders:', error);
        alert('Không thể tải danh sách đơn hàng');
    }
}

async function showChiTietDonHang(orderId) {
    try {
        const response = await fetch(`${API_URL}/admin/orders/${orderId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        if (!response.ok) throw new Error('Không thể lấy chi tiết đơn hàng');
        
        const { order } = await response.json();
        
        // Tạo modal hiển thị chi tiết
        let modalContent = `
            <div class="modal-header">
                <h5 class="modal-title">Chi tiết đơn hàng #${order._id}</h5>
                <button type="button" class="close" onclick="this.closest('.modal').style.display='none'">&times;</button>
            </div>
            <div class="modal-body">
                <p><strong>Khách hàng:</strong> ${order.user.username}</p>
                <p><strong>Địa chỉ:</strong> ${order.address}</p>
                <p><strong>Điện thoại:</strong> ${order.phone}</p>
                <p><strong>Ngày đặt:</strong> ${new Date(order.createdAt).toLocaleString('vi-VN')}</p>
                <p><strong>Trạng thái:</strong> ${order.status}</p>
                <hr>
                <h6>Sản phẩm:</h6>
                <table class="table">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Tên sản phẩm</th>
                            <th>Số lượng</th>
                            <th>Đơn giá</th>
                            <th>Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>`;
        
        order.items.forEach((item, index) => {
            modalContent += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${item.product.name}</td>
                    <td>${item.quantity}</td>
                    <td>${item.price.toLocaleString('vi-VN')}đ</td>
                    <td>${(item.price * item.quantity).toLocaleString('vi-VN')}đ</td>
                </tr>`;
        });
        
        modalContent += `
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="4" class="text-right"><strong>Tổng cộng:</strong></td>
                            <td><strong>${order.total.toLocaleString('vi-VN')}đ</strong></td>
                        </tr>
                    </tfoot>
                </table>
            </div>`;
        
        // Hiển thị modal
        let modal = document.getElementById('orderDetailModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'orderDetailModal';
            modal.className = 'modal';
            document.body.appendChild(modal);
        }
        modal.innerHTML = modalContent;
        modal.style.display = 'block';
    } catch (error) {
        console.error('Error loading order details:', error);
        alert('Không thể tải chi tiết đơn hàng');
    }
}

async function duyetDonHang(orderId, status) {
    try {
        const response = await fetch(`${API_URL}/admin/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: JSON.stringify({ status })
        });

        if (!response.ok) throw new Error('Không thể cập nhật trạng thái đơn hàng');
        
        alert('Cập nhật trạng thái đơn hàng thành công');
        addTableDonHang(); // Refresh table after update
    } catch (error) {
        console.error('Error updating order status:', error);
        alert('Lỗi khi cập nhật trạng thái đơn hàng');
    }
}
async function locDonHangTheoKhoangNgay() {
    try {
        const fromDate = document.getElementById('fromDate').value;
        const toDate = document.getElementById('toDate').value;

        if (!fromDate || !toDate) {
            alert('Vui lòng chọn khoảng thời gian');
            return;
        }

        const response = await fetch(`${API_URL}/admin/orders/filter?from=${fromDate}&to=${toDate}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });

        if (!response.ok) throw new Error('Không thể lọc đơn hàng');
        
        const { orders } = await response.json();
        
        var tc = document.getElementsByClassName('donhang')[0].getElementsByClassName('table-content')[0];
        var s = `<table class="table-outline hideImg">`;

        for (var i = 0; i < orders.length; i++) {
            var d = orders[i];
            s += `<tr>
                <td style="width: 5%">` + (i+1) + `</td>
                <td style="width: 13%">` + d._id + `</td>
                <td style="width: 7%">` + d.user.username + `</td>
                <td style="width: 20%">` + d.address + `</td>
                <td style="width: 15%">` + d.phone + `</td>
                <td style="width: 10%">` + d.total.toLocaleString('vi-VN') + `đ</td>
                <td style="width: 10%">` + d.status + `</td>
                <td style="width: 10%">` + new Date(d.createdAt).toLocaleDateString('vi-VN') + `</td>
                <td style="width: 10%">
                    <div class="tooltip">
                        <i class="fa fa-check" onclick="duyetDonHang('` + d._id + `', 'approved')"></i>
                        <span class="tooltiptext">Duyệt</span>
                    </div>
                    <div class="tooltip">
                        <i class="fa fa-remove" onclick="duyetDonHang('` + d._id + `', 'cancelled')"></i>
                        <span class="tooltiptext">Hủy</span>
                    </div>
                    <div class="tooltip">
                        <i class="fa fa-info" onclick="showChiTietDonHang('` + d._id + `')"></i>
                        <span class="tooltiptext">Chi tiết</span>
                    </div>
                </td>
            </tr>`;
        }

        s += `</table>`;
        tc.innerHTML = s;

        if (orders.length === 0) {
            alert('Không có đơn hàng nào trong khoảng thời gian này');
        }
    } catch (error) {
        console.error('Error filtering orders:', error);
        alert('Lỗi khi lọc đơn hàng');
    }
}
async function timKiemDonHang(inp) {
    var filter = inp.value.toUpperCase();
    if (!filter) {
        addTableDonHang();
        return;
    }

    try {
        const response = await fetch(`${API_URL}/admin/orders/search?q=${filter}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });

        if (!response.ok) throw new Error('Không thể tìm kiếm đơn hàng');
        
        const { orders } = await response.json();
        
        var tc = document.getElementsByClassName('donhang')[0].getElementsByClassName('table-content')[0];
        var s = `<table class="table-outline hideImg">`;

        for (var i = 0; i < orders.length; i++) {
            var d = orders[i];
            s += `<tr>
                <td style="width: 5%">` + (i+1) + `</td>
                <td style="width: 13%">` + d._id + `</td>
                <td style="width: 7%">` + d.user.username + `</td>
                <td style="width: 20%">` + d.address + `</td>
                <td style="width: 15%">` + d.phone + `</td>
                <td style="width: 10%">` + d.total.toLocaleString('vi-VN') + `đ</td>
                <td style="width: 10%">` + d.status + `</td>
                <td style="width: 10%">` + new Date(d.createdAt).toLocaleDateString('vi-VN') + `</td>
                <td style="width: 10%">
                    <div class="tooltip">
                        <i class="fa fa-check" onclick="duyetDonHang('` + d._id + `', 'approved')"></i>
                        <span class="tooltiptext">Duyệt</span>
                    </div>
                    <div class="tooltip">
                        <i class="fa fa-remove" onclick="duyetDonHang('` + d._id + `', 'cancelled')"></i>
                        <span class="tooltiptext">Hủy</span>
                    </div>
                    <div class="tooltip">
                        <i class="fa fa-info" onclick="showChiTietDonHang('` + d._id + `')"></i>
                        <span class="tooltiptext">Chi tiết</span>
                    </div>
                </td>
            </tr>`;
        }

        s += `</table>`;
        tc.innerHTML = s;

        if (orders.length === 0) {
            alert('Không tìm thấy đơn hàng nào');
        }
    } catch (error) {
        console.error('Error searching orders:', error);
        alert('Lỗi khi tìm kiếm đơn hàng');
    }
}
// Sắp xếp
function sortDonHangTable(loai) {
    var list = document.getElementsByClassName('donhang')[0].getElementsByClassName("table-content")[0];
    var tr = list.getElementsByTagName('tr');

    quickSort(tr, 0, tr.length-1, loai, getValueOfTypeInTable_DonHang); 
    decrease = !decrease;
}

// Lấy giá trị của loại(cột) dữ liệu nào đó trong bảng
function getValueOfTypeInTable_DonHang(tr, loai) {
    var td = tr.getElementsByTagName('td');
    switch(loai) {
        case 'stt': return Number(td[0].innerHTML);
        case 'ma' : return new Date(td[1].innerHTML); // chuyển về dạng ngày để so sánh ngày
        case 'khach' : return td[2].innerHTML.toLowerCase(); // lấy tên khách
        case 'sanpham' : return td[3].children.length;    // lấy số lượng hàng trong đơn này, length ở đây là số lượng <p>
        case 'tongtien' : return stringToNum(td[4].innerHTML); // trả về dạng giá tiền
        case 'ngaygio' : return new Date(td[5].innerHTML); // chuyển về ngày
        case 'trangthai': return td[6].innerHTML.toLowerCase(); // trả về trạng thái đơn hàng 
    }
    return false;
}

// ====================== Khách Hàng =============================
// Vẽ bảng
async function addTableKhachHang() {
    try {
        const response = await fetch(`${API_URL}/admin/users`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        if (!response.ok) throw new Error('Không thể lấy danh sách khách hàng');
        
        const { users } = await response.json();
        
        var tc = document.getElementsByClassName('khachhang')[0].getElementsByClassName('table-content')[0];
        var s = `<table class="table-outline hideImg">`;

        for (var i = 0; i < users.length; i++) {
            var u = users[i];
            s += `<tr>
                <td style="width: 5%">` + (i+1) + `</td>
                <td style="width: 20%">` + u.username + `</td>
                <td style="width: 30%">` + u.email + `</td>
                <td style="width: 20%">` + (u.isLocked ? 'Bị khóa' : 'Hoạt động') + `</td>
                <td style="width: 25%">
                    <div class="tooltip">
                        <i class="fa fa-lock" onclick="voHieuHoaNguoiDung('` + u._id + `', ` + !u.isLocked + `)"></i>
                        <span class="tooltiptext">` + (u.isLocked ? 'Mở khóa' : 'Khóa') + `</span>
                    </div>
                    <div class="tooltip">
                        <i class="fa fa-trash" onclick="xoaNguoiDung('` + u._id + `')"></i>
                        <span class="tooltiptext">Xóa</span>
                    </div>
                </td>
            </tr>`;
        }

        s += `</table>`;
        tc.innerHTML = s;
    } catch (error) {
        console.error('Error loading users:', error);
        alert('Không thể tải danh sách khách hàng');
    }
}

// Tìm kiếm
async function timKiemNguoiDung(inp) {
    var filter = inp.value.toUpperCase();
    if (!filter) {
        addTableKhachHang();
        return;
    }

    try {
        const response = await fetch(`${API_URL}/admin/users/search?q=${filter}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });

        if (!response.ok) throw new Error('Không thể tìm kiếm người dùng');
        
        const { users } = await response.json();
        
        var tc = document.getElementsByClassName('khachhang')[0].getElementsByClassName('table-content')[0];
        var s = `<table class="table-outline hideImg">`;

        for (var i = 0; i < users.length; i++) {
            var u = users[i];
            s += `<tr>
                <td style="width: 5%">` + (i+1) + `</td>
                <td style="width: 20%">` + u.username + `</td>
                <td style="width: 30%">` + u.email + `</td>
                <td style="width: 20%">` + (u.isLocked ? 'Bị khóa' : 'Hoạt động') + `</td>
                <td style="width: 25%">
                    <div class="tooltip">
                        <i class="fa fa-lock" onclick="voHieuHoaNguoiDung('` + u._id + `', ` + !u.isLocked + `)"></i>
                        <span class="tooltiptext">` + (u.isLocked ? 'Mở khóa' : 'Khóa') + `</span>
                    </div>
                    <div class="tooltip">
                        <i class="fa fa-trash" onclick="xoaNguoiDung('` + u._id + `')"></i>
                        <span class="tooltiptext">Xóa</span>
                    </div>
                </td>
            </tr>`;
        }

        s += `</table>`;
        tc.innerHTML = s;
    } catch (error) {
        console.error('Error searching users:', error);
        alert('Lỗi khi tìm kiếm người dùng');
    }
}

function openThemNguoiDung() {
    window.alert('Not Available!');
}

// vô hiệu hóa người dùng (tạm dừng, không cho đăng nhập vào)
async function voHieuHoaNguoiDung(userId, isLocked) {
    try {
        const response = await fetch(`${API_URL}/admin/users/${userId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: JSON.stringify({ isLocked })
        });

        if (!response.ok) throw new Error('Không thể cập nhật trạng thái người dùng');
        
        alert('Cập nhật trạng thái người dùng thành công');
        addTableKhachHang();
    } catch (error) {
        console.error('Error updating user status:', error);
        alert('Lỗi khi cập nhật trạng thái người dùng');
    }
}
// Xóa người dùng
async function xoaNguoiDung(userId) {
    if (confirm('Bạn có chắc muốn xóa người dùng này?')) {
        try {
            const response = await fetch(`${API_URL}/admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });

            if (!response.ok) throw new Error('Không thể xóa người dùng');
            
            alert('Xóa người dùng thành công');
            addTableKhachHang();
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Lỗi khi xóa người dùng');
        }
    }
}


// Sắp xếp
function sortKhachHangTable(loai) {
    var list = document.getElementsByClassName('khachhang')[0].getElementsByClassName("table-content")[0];
    var tr = list.getElementsByTagName('tr');

    quickSort(tr, 0, tr.length-1, loai, getValueOfTypeInTable_KhachHang); 
    decrease = !decrease;
}

function getValueOfTypeInTable_KhachHang(tr, loai) {
    var td = tr.getElementsByTagName('td');
    switch(loai) {
        case 'stt': return Number(td[0].innerHTML);
        case 'hoten' : return td[1].innerHTML.toLowerCase();
        case 'email' : return td[2].innerHTML.toLowerCase();
        case 'taikhoan' : return td[3].innerHTML.toLowerCase();    
        case 'matkhau' : return td[4].innerHTML.toLowerCase(); 
    }
    return false;
}

// ================== Sort ====================
// https://github.com/HoangTran0410/First_html_css_js/blob/master/sketch.js
var decrease = true; // Sắp xếp giảm dần

// loại là tên cột, func là hàm giúp lấy giá trị từ cột loai
function quickSort(arr, left, right, loai, func) {
    var pivot,
        partitionIndex;

    if (left < right) {
        pivot = right;
        partitionIndex = partition(arr, pivot, left, right, loai, func);

        //sort left and right
        quickSort(arr, left, partitionIndex - 1, loai, func);
        quickSort(arr, partitionIndex + 1, right, loai, func);
    }
    return arr;
}

function partition(arr, pivot, left, right, loai, func) { //patition là hàm chia mảng thành 2 phần để sắp xếp
    var pivotValue =  func(arr[pivot], loai),
        partitionIndex = left;
    
    for (var i = left; i < right; i++) {
        if (decrease && func(arr[i], loai) > pivotValue
        || !decrease && func(arr[i], loai) < pivotValue) {
            swap(arr, i, partitionIndex);
            partitionIndex++;
        }
    }
    swap(arr, right, partitionIndex);
    return partitionIndex;
}

function swap(arr, i, j) {
    var tempi = arr[i].cloneNode(true);
    var tempj = arr[j].cloneNode(true);
    arr[i].parentNode.replaceChild(tempj, arr[i]);
    arr[j].parentNode.replaceChild(tempi, arr[j]);
}

// ================= các hàm thêm ====================
// Chuyển khuyến mãi vễ dạng chuỗi tiếng việt
function promoToStringValue(pr) { // promoToStringValue là hàm chuyển đổi giá trị khuyến mãi về dạng chuỗi tiếng việt
    switch (pr.name) {
        case 'tragop':
            return 'Góp ' + pr.value + '%';
        case 'giamgia':
            return 'Giảm ' + pr.value;
        case 'giareonline':
            return 'Online (' + pr.value + ')';
        case 'moiramat':
            return 'Mới';
        case 'giarehon':
            return 'Rẻ hơn'; 
    }
    return '';
}

function progress(percent, bg, width, height) {

    return `<div class="progress" style="width: ` + width + `; height:` + height + `">
                <div class="progress-bar bg-info" style="width: ` + percent + `%; background-color:` + bg + `"></div>
            </div>`
}
