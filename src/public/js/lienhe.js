window.onload = async function () {
    await khoiTao();

    // thêm tags (từ khóa) vào khung tìm kiếm
    const tags = ["Samsung", "iPhone", "Vivo", "Oppo", "Xiaomi"];
    for (const t of tags) {
        addTags(t, "index.html?search=" + t);
    }
}
async function nguoidung() {
    const form = document.formlh;
    const hoten = form.ht.value.trim();
    const dienthoai = form.sdt.value.trim();
    const noidung = form.nd.value.trim();

    if (!hoten || !checkName(hoten)) {
        addAlertBox('Họ tên không phù hợp.', '#f55', '#000', 3000);
        form.ht.focus();
        return false;
    }

    if (!dienthoai || !checkPhone(dienthoai)) {
        addAlertBox('Số điện thoại không phù hợp.', '#f55', '#000', 3000);
        form.sdt.focus();
        return false;
    }

    try {
        await callApi('/api/contact', 'POST', {
            name: hoten,
            phone: dienthoai,
            message: noidung
        });
        
        addAlertBox('Gửi thành công. Chúng tôi chân thành cám ơn những góp ý từ bạn.', '#5f5', '#000', 5000);
        form.reset();
    } catch (error) {
        console.error('Lỗi gửi liên hệ:', error);
        addAlertBox('Có lỗi xảy ra khi gửi liên hệ. Vui lòng thử lại sau.', '#f55', '#000', 3000);
    }
    
    return false;
}

function checkName(str) {
    if (!str || str.length < 2) return false;
    const special = '~!@#$%^&*()_+=-`./*{}[]|\'<>?;"';
    
    for (let i = 0; i < str.length; i++) {
        if (Number(str[i])) return false;
        if (special.includes(str[i])) return false;
    }
    return true;
}

function checkPhone(phone) {
    if (!phone || phone.length < 10 || phone.length > 11) return false;
    return /^[0-9]+$/.test(phone);
}
