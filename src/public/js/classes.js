function User(username, pass, ho, ten, email, products, donhang) {
    this.username = username || '';
    this.pass = pass || '';
    this.ho = ho || '';
    this.ten = ten || '';
    this.email = email || '';
    this.products = products || [];
    this.donhang = donhang || [];
}

function equalUser(u1, u2) {
    if (!u1 || !u2) return false;
    return (u1.username === u2.username && u1.pass === u2.pass);
}

function Promo(name, value) {
    this.name = name;
    this.value = value;

    this.toWeb = function() {
        if (!this.name) return "";
        
        var contentLabel = "";
        switch (this.name) {
            case "giamgia":
                contentLabel = `<i class="fa fa-bolt"></i> Giảm ${this.value}₫`;
                break;

            case "tragop":
                contentLabel = `Trả góp ${this.value}%`;
                break;

            case "giareonline":
                contentLabel = "Giá rẻ online";
                break;

            case "moiramat":
                contentLabel = "Mới ra mắt";
                break;
            
            case "giarehon":
                contentLabel = "Giá rẻ hơn";
                break;

            default:
                return "";
        }

        return `<label class="${this.name}">${contentLabel}</label>`;
    }
}
function Product(masp, name, img, price, star, rateCount, promo, detail) {
    this.masp = masp || '';
    this.name = name || '';
    this.img = img || '';
    this.price = price || 0;
    this.star = star || 0;
    this.rateCount = rateCount || 0;
    this.promo = promo || null;
    this.detail = detail || {};
}

function addToWeb(p, ele, returnString) {
    if (!p) return;

    // Chuyển star sang dạng tag html
    var rating = "";
    if (p.rateCount > 0) {
        for (var i = 1; i <= 5; i++) {
            rating += i <= p.star 
                ? '<i class="fa fa-star"></i>'
                : '<i class="fa fa-star-o"></i>';
        }
        rating += `<span>${p.rateCount} đánh giá</span>`;
    }

    // Chuyển giá tiền sang dạng tag html
    var price = `<strong>${p.price}₫</strong>`;
    if (p.promo && p.promo.name === "giareonline") {
        price = `<strong>${p.promo.value}₫</strong>
                <span>${p.price}₫</span>`;
    }

    // Tạo link tới chi tiết sản phẩm
    var chitietSp = `chitietsanpham.html?code=${p.masp}`;

    // Tạo HTML cho sản phẩm
    var productHtml = `<li class="sanPham">
        <a href="${chitietSp}">
            <img src="${p.img}" alt="${p.name}">
            <h3>${p.name}</h3>
            <div class="price">
                ${price}
            </div>
            <div class="ratingresult">
                ${rating}
            </div>
            ${p.promo ? p.promo.toWeb() : ''}
            <div class="tooltip">
                <button class="themvaogio" onclick="return themVaoGioHang('${p.masp}', '${p.name}')">
                    <span class="tooltiptext">Thêm vào giỏ</span>
                    +
                </button>
            </div>
        </a>
    </li>`;

    if (returnString) return productHtml;
    if (ele) ele.innerHTML += productHtml;
}