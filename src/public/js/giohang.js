var currentuser;

window.onload = async function () {
    try {
        await khoiTao();
        const token = localStorage.getItem('token');
        if (token) {
            const cartResponse = await callApi('/api/cart');
            currentuser = { products: cartResponse.data.cart };
            await addProductToTable(currentuser);
        } else {
            addProductToTable(null);
        }
    } catch (error) {
        console.error('Lỗi khởi tạo trang:', error);
        addProductToTable(null);
    }
}

async function addProductToTable(user) {
    const table = document.getElementsByClassName('listSanPham')[0];

    let s = `
        <tbody>
            <tr>
                <th>STT</th>
                <th>Sản phẩm</th>
                <th>Giá</th>
                <th>Số lượng</th>
                <th>Thành tiền</th>
                <th>Thời gian</th>
                <th>Xóa</th>
            </tr>`;

    if (!user) {
        s += `
            <tr>
                <td colspan="7"> 
                    <h1 style="color:red; background-color:white; font-weight:bold; text-align:center; padding: 15px 0;">
                        Bạn chưa đăng nhập !!
                    </h1> 
                </td>
            </tr>
        `;
        table.innerHTML = s;
        return;
    } 
    
    if (!user.products?.length) {
        s += `
            <tr>
                <td colspan="7"> 
                    <h1 style="color:green; background-color:white; font-weight:bold; text-align:center; padding: 15px 0;">
                        Giỏ hàng trống !!
                    </h1> 
                </td>
            </tr>
        `;
        table.innerHTML = s;
        return;
    }

    let totalPrice = 0;
    
    try {
        for (let i = 0; i < user.products.length; i++) {
            const cartItem = user.products[i];
            const p = cartItem.product; // Product đã được populate từ backend
            
            if (!p) continue;

            const soluongSp = cartItem.quantity;
            const price = p.promo?.name === 'giareonline' ? p.promo.value : p.price;
            const thoigian = new Date(cartItem.date).toLocaleString();
            const thanhtien = price * soluongSp;

            s += `
                <tr>
                    <td>${i + 1}</td>
                    <td class="noPadding imgHide">
                        <a target="_blank" href="chitietsanpham.html?code=${p._id}" title="Xem chi tiết">
                            ${p.name}
                            <img src="${p.img}" alt="${p.name}">
                        </a>
                    </td>
                    <td class="alignRight">${numToString(price)}₫</td>
                    <td class="soluong">
                        <button onclick="giamSoLuong('${p._id}')"><i class="fa fa-minus"></i></button>
                        <input size="1" onchange="capNhatSoLuongFromInput(this, '${p._id}')" value="${soluongSp}">
                        <button onclick="tangSoLuong('${p._id}')"><i class="fa fa-plus"></i></button>
                    </td>
                    <td class="alignRight">${numToString(thanhtien)}₫</td>
                    <td style="text-align: center">${thoigian}</td>
                    <td class="noPadding"> 
                        <i class="fa fa-trash" onclick="xoaSanPhamTrongGioHang(${i})"></i> 
                    </td>
                </tr>
            `;

            totalPrice += thanhtien;
        }

        s += `
                <tr style="font-weight:bold; text-align:center">
                    <td colspan="4">TỔNG TIỀN: </td>
                    <td class="alignRight">${numToString(totalPrice)}₫</td>
                    <td class="thanhtoan" onclick="thanhToan()"> Thanh Toán </td>
                    <td class="xoaHet" onclick="xoaHet()"> Xóa hết </td>
                </tr>
            </tbody>
        `;

        table.innerHTML = s;
    } catch (error) {
        console.error('Lỗi khi tải sản phẩm:', error);
        addAlertBox('Có lỗi khi tải thông tin sản phẩm', '#aa0000', '#fff', 2000);
    }
}

async function xoaSanPhamTrongGioHang(i) {
    try {
        if (window.confirm('Xác nhận hủy mua')) {
            const productToRemove = currentuser.products[i];
            await callApi(`/api/cart/${productToRemove.product._id}`, 'DELETE');
            currentuser.products.splice(i, 1);
            await capNhatMoiThu();
        }
    } catch (error) {
        console.error('Lỗi khi xóa sản phẩm:', error);
        addAlertBox('Có lỗi khi xóa sản phẩm', '#aa0000', '#fff', 2000);
    }
}

async function thanhToan() {
    try {
        if (!currentuser) {
            addAlertBox('Vui lòng đăng nhập để thanh toán', '#aa0000', '#fff', 2000);
            return;
        }

        if (!currentuser.products?.length) {
            addAlertBox('Không có mặt hàng nào cần thanh toán !!', '#ffb400', '#fff', 2000);
            return;
        }

        if (window.confirm('Thanh toán giỏ hàng?')) {
            await callApi('/api/orders', 'POST', {
                items: currentuser.products.map(p => ({
                    productId: p.product._id,
                    quantity: p.quantity
                }))
            });

            // Xóa giỏ hàng sau khi thanh toán
            await callApi('/api/cart/clear', 'POST');
            currentuser.products = [];
            await capNhatMoiThu();
            addAlertBox('Đơn hàng đã được tạo thành công.', '#17c671', '#fff', 4000);
        }
    } catch (error) {
        console.error('Lỗi khi thanh toán:', error);
        addAlertBox('Có lỗi khi tạo đơn hàng', '#aa0000', '#fff', 2000);
    }
}

async function xoaHet() {
    try {
        if (currentuser.products?.length) {
            if (window.confirm('Bạn có chắc chắn muốn xóa hết sản phẩm trong giỏ?')) {
                await callApi('/api/cart/clear', 'POST');
                currentuser.products = [];
                await capNhatMoiThu();
            }
        }
    } catch (error) {
        console.error('Lỗi khi xóa giỏ hàng:', error);
        addAlertBox('Có lỗi khi xóa giỏ hàng', '#aa0000', '#fff', 2000);
    }
}

async function capNhatSoLuongFromInput(inp, productId) {
    try {
        const soLuongMoi = Number(inp.value);
        if (!soLuongMoi || soLuongMoi <= 0) {
            inp.value = 1;
            return;
        }

        await callApi('/api/cart', 'PUT', {
            productId: productId,
            quantity: soLuongMoi
        });

        for (const p of currentuser.products) {
            if (p.product._id === productId) {
                p.quantity = soLuongMoi;
                break;
            }
        }

        await capNhatMoiThu();
    } catch (error) {
        console.error('Lỗi khi cập nhật số lượng:', error);
        addAlertBox('Có lỗi khi cập nhật số lượng', '#aa0000', '#fff', 2000);
    }
}

async function tangSoLuong(productId) {
    try {
        for (const p of currentuser.products) {
            if (p.product._id === productId) {
                await callApi('/api/cart', 'PUT', {
                    productId: productId,
                    quantity: p.quantity + 1
                });
                p.quantity++;
                break;
            }
        }

        await capNhatMoiThu();
    } catch (error) {
        console.error('Lỗi khi tăng số lượng:', error);
        addAlertBox('Có lỗi khi tăng số lượng', '#aa0000', '#fff', 2000);
    }
}

async function giamSoLuong(productId) {
    try {
        for (const p of currentuser.products) {
            if (p.product._id === productId && p.quantity > 1) {
                await callApi('/api/cart', 'PUT', {
                    productId: productId,
                    quantity: p.quantity - 1
                });
                p.quantity--;
                break;
            }
        }

        await capNhatMoiThu();
    } catch (error) {
        console.error('Lỗi khi giảm số lượng:', error);
        addAlertBox('Có lỗi khi giảm số lượng', '#aa0000', '#fff', 2000);
    }
}

async function capNhatMoiThu() {
    try {
        const cartResponse = await callApi('/api/cart');
        currentuser = { products: cartResponse.data.cart };
        await addProductToTable(currentuser);
    } catch (error) {
        console.error('Lỗi khi cập nhật:', error);
        addAlertBox('Có lỗi khi cập nhật thông tin', '#aa0000', '#fff', 2000);
    }
}