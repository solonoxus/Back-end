window.onload = async function () {
    await khoiTao();

    // Thêm hình vào banner
    const numBanner = 8;
    for (let i = 1; i <= numBanner; i++) {
        const linkimg = `img/banners/banner${i}.png`;
        addBanner(linkimg, linkimg);
    }

    // Khởi động thư viện hỗ trợ banner
    const owl = $('.owl-carousel');
    owl.owlCarousel({
        items: 1.5,
        margin: 100,
        center: true,
        loop: true,
        smartSpeed: 450,
        autoplay: true,
        autoplayTimeout: 3500
    });

    // Lấy sản phẩm từ API cho autocomplete
    try {
        const response = await callApi('/api/products');
        const products = response.data;
        autocomplete(document.getElementById('search-box'), products);
    } catch (error) {
        console.error('Lỗi lấy dữ liệu sản phẩm:', error);
    }

    // Thêm tags
    const tags = ['Samsung', 'iPhone', 'Vivo', 'Oppo'];
    for (const t of tags) {
        addTags(t, 'index.html?search=' + t);
    }

    // Thêm danh sách hãng điện thoại
    const company = [
        'Apple.jpg',
        'Samsung.jpg',
        'Oppo.jpg',
        'Vivo.jpg',
        'Xiaomi.png'
    ];
    for (const c of company) {
        addCompany('img/company/' + c, c.slice(0, c.length - 4));
    }

    // Xử lý filters và hiển thị sản phẩm
    const filters = getFilterFromURL();
    if (filters.length) {
        try {
            const sanPhamPhanTich = await phanTich_URL(filters, true);
            const sanPhamPhanTrang = tinhToanPhanTrang(sanPhamPhanTich, filtersFromUrl.page || 1);
            
            if (!sanPhamPhanTrang.length) {
                alertNotHaveProduct(false);
            } else {
                addProductsFrom(sanPhamPhanTrang);
            }
            document.getElementsByClassName('contain-products')[0].style.display = '';
        } catch (error) {
            console.error('Lỗi xử lý filters:', error);
            alertNotHaveProduct(false);
        }
    } else {
        const soLuong = window.innerWidth < 1200 ? 3 : 3;
        const div = document.getElementsByClassName('contain-khungSanPham')[0];

        // Các màu
        const yellow_red = ['#ff9c00', '#ec1f1f'];
        const blue = ['#42bcf4', '#004c70'];
        const green = ['#5de272', '#007012'];

        // Thêm các khung sản phẩm
        await Promise.all([
            addKhungSanPham('NỔI BẬT NHẤT', yellow_red, ['star=3', 'sort=rateCount-decrease'], soLuong, div),
            addKhungSanPham('SẢN PHẨM MỚI', blue, ['promo=moiramat', 'sort=rateCount-decrease'], soLuong, div),
            addKhungSanPham('TRẢ GÓP 0%', yellow_red, ['promo=tragop'], soLuong, div),
            addKhungSanPham('GIÁ SỐC ONLINE', green, ['promo=giareonline'], soLuong, div),
            addKhungSanPham('GIẢM GIÁ LỚN', yellow_red, ['promo=giamgia'], soLuong, div),
            addKhungSanPham('GIÁ RẺ HƠN', green, ['promo=giarehon'], soLuong, div)
        ]);
    }

  // Thêm chọn mức giá
  addPricesRange(0, 2000000);
  addPricesRange(2000000, 4000000);
  addPricesRange(4000000, 7000000);
  addPricesRange(7000000, 13000000);
  addPricesRange(13000000, 0);

  // Thêm chọn khuyến mãi
  addPromotion("giamgia");
  addPromotion("tragop");
  addPromotion("moiramat");
  addPromotion("giareonline");

  // Thêm chọn số sao
  addStarFilter(3);
  addStarFilter(4);
  addStarFilter(5);

  // Thêm chọn sắp xếp
  addSortFilter("ascending", "price", "Giá tăng dần");
  addSortFilter("decrease", "price", "Giá giảm dần");
  addSortFilter("ascending", "star", "Sao tăng dần");
  addSortFilter("decrease", "star", "Sao giảm dần");
  addSortFilter("ascending", "rateCount", "Đánh giá tăng dần");
  addSortFilter("decrease", "rateCount", "Đánh giá giảm dần");
  addSortFilter("ascending", "name", "Tên A-Z");
  addSortFilter("decrease", "name", "Tên Z-A");

  // Thêm filter đã chọn
  addAllChoosedFilter();
};

var soLuongSanPhamMaxTrongMotTrang = 15;

// =========== Đọc dữ liệu từ url ============
var filtersFromUrl = {
  // Các bộ lọc tìm được trên url sẽ đc lưu vào đây
  company: "",
  search: "",
  price: "",
  promo: "",
  star: "",
  page: "",
  sort: {
    by: "",
    type: "ascending"
  }
};

function getFilterFromURL() {
  // tách và trả về mảng bộ lọc trên url
  var fullLocation = window.location.href;
  fullLocation = decodeURIComponent(fullLocation);
  var dauHoi = fullLocation.split("?"); // tách theo dấu ?

  if (dauHoi[1]) {
    var dauVa = dauHoi[1].split("&");
    return dauVa;
  }

  return [];
}
async function chuyenTrang(page) {
    try {
        // Cập nhật URL
        const url = new URL(window.location.href);
        url.searchParams.set('page', page);
        window.history.pushState({}, '', url.toString());

        // Lấy filters hiện tại
        const filters = getFilterFromURL();
        
        // Lấy dữ liệu trang mới
        const sanPhamPhanTich = await phanTich_URL(filters, true);
        const sanPhamPhanTrang = await tinhToanPhanTrang(sanPhamPhanTich, page);

        // Xóa sản phẩm cũ
        document.getElementsByClassName('contain-products')[0].innerHTML = '';
        
        // Thêm sản phẩm mới
        if (!sanPhamPhanTrang.length) {
            alertNotHaveProduct(false);
        } else {
            addProductsFrom(sanPhamPhanTrang);
        }

        // Cuộn lên đầu trang
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    } catch (error) {
        console.error('Lỗi chuyển trang:', error);
        addAlertBox('Có lỗi xảy ra khi chuyển trang.', '#f55', '#000', 3000);
    }
}

// Thêm hàm xử lý popstate để back/forward vẫn hoạt động
window.onpopstate = async function(event) {
    const page = new URLSearchParams(window.location.search).get('page') || 1;
    await chuyenTrang(page);
};
async function phanTich_URL(filters, saveFilter) {
    try {
        const queryParams = new URLSearchParams();
        
        for (const filter of filters) {
            const [key, value] = filter.split('=');
            
            switch (key) {
                case 'search':
                    const searchTerm = value.split('+').join(' ');
                    queryParams.append('search', searchTerm);
                    if (saveFilter) filtersFromUrl.search = searchTerm;
                    break;

                case 'price':
                    const prices = value.split('-');
                    queryParams.append('minPrice', prices[0]);
                    queryParams.append('maxPrice', prices[1]);
                    if (saveFilter) filtersFromUrl.price = value;
                    break;

                case 'company':
                    queryParams.append('company', value);
                    if (saveFilter) filtersFromUrl.company = value;
                    break;

                case 'star':
                    queryParams.append('rating', value);
                    if (saveFilter) filtersFromUrl.star = value;
                    break;

                case 'promo':
                    queryParams.append('promotion', value);
                    if (saveFilter) filtersFromUrl.promo = value;
                    break;

                case 'sort':
                    const [by, type] = value.split('-');
                    queryParams.append('sortBy', by);
                    queryParams.append('sortType', type || 'ascending');
                    if (saveFilter) {
                        filtersFromUrl.sort.by = by;
                        filtersFromUrl.sort.type = type || 'ascending';
                    }
                    break;

                case 'page':
                    queryParams.append('page', value);
                    if (saveFilter) filtersFromUrl.page = value;
                    break;
            }
        }

        const response = await callApi(`/api/products?${queryParams.toString()}`);
        return response.data;

    } catch (error) {
        console.error('Lỗi khi lọc sản phẩm:', error);
        return [];
    }
}
// thêm các sản phẩm từ biến mảng nào đó vào trang
function addProductsFrom(list, vitri = 0, soluong = list.length) {
    const container = document.getElementsByClassName('contain-products')[0];
    
    // Tạo container cho sản phẩm
    const productsContainer = document.createElement('div');
    productsContainer.classList.add('flexContain');

    // Thêm từng sản phẩm
    const end = Math.min(vitri + soluong, list.length);
    for (let i = vitri; i < end; i++) {
        // Sử dụng hàm addProduct từ dungchung.js
        addProduct(list[i], productsContainer);
    }

    // Cập nhật container
    container.innerHTML = '';
    container.appendChild(productsContainer);
}
function clearAllProducts() {
  document.getElementById("products").innerHTML = "";
}

// Thêm sản phẩm vào các khung sản phẩm
async function addKhungSanPham(tenKhung, color, filter, len, ele) {
    const gradient = `background-image: linear-gradient(120deg, ${color[0]} 0%, ${color[1]} 50%, ${color[0]} 100%);`;
    const div = document.createElement('div');
    div.classList.add('khungSanPham');
    
    div.innerHTML = `
        <h3 class="tenKhung" style="${gradient}">
            ${tenKhung}
        </h3>
        <div class="listSpTrongKhung flexContain">
            <div class="loader"></div>
        </div>
    `;
    
    ele.appendChild(div);
    
    try {
        const result = await phanTich_URL(filter, false);
        const products = result.slice(0, len);
        
        if (products.length) {
            div.querySelector('.listSpTrongKhung').innerHTML = '';
            for (const p of products) {
                addProduct(p, div.querySelector('.listSpTrongKhung'));
            }
        } else {
            div.querySelector('.listSpTrongKhung').innerHTML = 'Không có sản phẩm nào...';
        }
    } catch (error) {
        console.error('Lỗi tải sản phẩm cho khung:', tenKhung, error);
        div.querySelector('.listSpTrongKhung').innerHTML = 'Có lỗi xảy ra...';
    }
}
// Nút phân trang
function themNutPhanTrang(soTrang, trangHienTai) {
    const divPhanTrang = document.getElementsByClassName('pagination')[0];
    divPhanTrang.innerHTML = '';

    if (soTrang <= 1) return;

    // Nút First
    if (trangHienTai > 1) {
        divPhanTrang.innerHTML += `
            <a onclick="chuyenTrang(1)">
                <i class="fa fa-angle-double-left"></i>
            </a>
        `;
    }

    // Các nút số trang
    let start = Math.max(1, trangHienTai - 2);
    let end = Math.min(soTrang, trangHienTai + 2);

    for (let i = start; i <= end; i++) {
        divPhanTrang.innerHTML += `
            <a onclick="chuyenTrang(${i})" 
               class="${i == trangHienTai ? 'current' : ''}">
                ${i}
            </a>
        `;
    }

    // Nút Last
    if (trangHienTai < soTrang) {
        divPhanTrang.innerHTML += `
            <a onclick="chuyenTrang(${soTrang})">
                <i class="fa fa-angle-double-right"></i>
            </a>
        `;
    }
}


// Tính toán xem có bao nhiêu trang + trang hiện tại,
// Trả về mảng sản phẩm trong trang hiện tại tính được
async function tinhToanPhanTrang(list, vitriTrang) {
    const productsPerPage = 15;
    try {
        const response = await callApi(`/api/products?page=${vitriTrang}&limit=${productsPerPage}`);
        const { data, pagination } = response;
        
        // Cập nhật UI phân trang
        themNutPhanTrang(pagination.totalPages, vitriTrang);
        
        return data;
    } catch (error) {
        console.error('Lỗi tải dữ liệu phân trang:', error);
        return [];
    }
}
// ======== TÌM KIẾM (Từ mảng list truyền vào, trả về 1 mảng kết quả) ============

// function timKiemTheoTen(list, ten, soluong) {}
// hàm Tìm-kiếm-theo-tên được đặt trong dungchung.js , do trang chitietsanpham cũng cần dùng tới nó

async function timKiemTheoCongTySanXuat(list, tenCongTy, soluong) {
    try {
        const response = await callApi(`/api/products?company=${tenCongTy}`);
        let result = response.data;

        if (soluong && result.length > soluong) {
            result = result.slice(0, soluong);
        }
        return result;
    } catch (error) {
        console.error('Lỗi tìm kiếm theo công ty:', error);
        return [];
    }
}

async function timKiemTheoSoLuongSao(list, soLuongSaoToiThieu, soluong) {
    try {
        const response = await callApi(`/api/products?rating=${soLuongSaoToiThieu}`);
        let result = response.data;

        if (soluong && result.length > soluong) {
            result = result.slice(0, soluong);
        }
        return result;
    } catch (error) {
        console.error('Lỗi tìm kiếm theo số sao:', error);
        return [];
    }
}


async function timKiemTheoGiaTien(list, giaMin, giaMax, soluong) {
    try {
        const response = await callApi(`/api/products?minPrice=${giaMin}&maxPrice=${giaMax}`);
        let result = response.data;

        if (soluong && result.length > soluong) {
            result = result.slice(0, soluong);
        }
        return result;
    } catch (error) {
        console.error('Lỗi tìm kiếm theo giá:', error);
        return [];
    }
}

async function timKiemTheoKhuyenMai(list, tenKhuyenMai, soluong) {
    try {
        const response = await callApi(`/api/products?promotion=${tenKhuyenMai}`);
        let result = response.data;

        if (soluong && result.length > soluong) {
            result = result.slice(0, soluong);
        }
        return result;
    } catch (error) {
        console.error('Lỗi tìm kiếm theo khuyến mãi:', error);
        return [];
    }
}

function timKiemTheoRAM(list, luongRam, soluong) {
  var count,
    result = [];
  if (soluong < list.length) count = soluong;
  else count = list.length;

  for (var i = 0; i < list.length; i++) {
    if (parseInt(list[i].detail.ram) == luongRam) {
      result.push(list[i]);
      count--;
      if (count <= 0) break;
    }
  }

  return result;
}

// ========== LỌC ===============
// Thêm bộ lọc đã chọn vào html
function addChoosedFilter(type, textInside) {
  var link = createLinkFilter("remove", type);
  var tag_a =
    `<a href="` +
    link +
    `"><h3>` +
    textInside +
    ` <i class="fa fa-close"></i> </h3></a>`;

  var divChoosedFilter = document.getElementsByClassName("choosedFilter")[0];
  divChoosedFilter.innerHTML += tag_a;

  var deleteAll = document.getElementById("deleteAllFilter");
  deleteAll.style.display = "block";
  deleteAll.href = window.location.href.split("?")[0];
}

// Thêm nhiều bộ lọc cùng lúc
function addAllChoosedFilter() {
  // Thêm từ biến lưu giữ bộ lọc 'filtersFromUrl'

  if (filtersFromUrl.company != "")
    addChoosedFilter("company", filtersFromUrl.company);

  if (filtersFromUrl.search != "")
    addChoosedFilter("search", '"' + filtersFromUrl.search + '"');

  if (filtersFromUrl.price != "") {
    var prices = filtersFromUrl.price.split("-");
    addChoosedFilter("price", priceToString(prices[0], prices[1]));
  }

  if (filtersFromUrl.promo != "")
    addChoosedFilter("promo", promoToString(filtersFromUrl.promo));

  if (filtersFromUrl.star != "")
    addChoosedFilter("star", starToString(filtersFromUrl.star));

  if (filtersFromUrl.sort.by != "") {
    var sortBy = sortToString(filtersFromUrl.sort.by);
    var kieuSapXep =
      filtersFromUrl.sort.type == "decrease" ? "giảm dần" : "tăng dần";
    addChoosedFilter("sort", sortBy + kieuSapXep);
  }
}

// Tạo link cho bộ lọc
// type là 'add' hoặc 'remove',
// tương ứng 'thêm' bộ lọc mới có giá trị = valueAdd, hoặc 'xóa' bộ lọc đã có
function createLinkFilter(type, nameFilter, valueAdd) {
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);
    
    if (type == 'remove') {
        params.delete(nameFilter);
    } else if (type == 'add') {
        // Xử lý đặc biệt cho sort
        if (nameFilter == 'sort') {
            const [by, typesort] = valueAdd.split('-');
            params.set(nameFilter, valueAdd);
        } else {
            params.set(nameFilter, valueAdd);
        }
    }

    // Luôn reset page về 1 khi thay đổi filter
    if (nameFilter != 'page') {
        params.delete('page');
    }

    return '?' + params.toString();
}

// Thông báo nếu không có sản phẩm
function alertNotHaveProduct(coSanPham) {
  var thongbao = document.getElementById("khongCoSanPham");
  if (!coSanPham) {
    thongbao.style.width = "auto";
    thongbao.style.opacity = "1";
    thongbao.style.margin = "auto"; // Căn giữa
    thongbao.style.transitionDuration = "1s"; // hiện ra từ từ
  } else {
    thongbao.style.width = "0";
    thongbao.style.opacity = "0";
    thongbao.style.margin = "0";
    thongbao.style.transitionDuration = "0s"; // Ngay lâp tức biến mất
  }
}

// ========== Lọc TRONG TRANG ============
// Hiển thị Sản phẩm
function showLi(li) {
  li.style.opacity = 1;
  li.style.width = "239px";
  li.style.borderWidth = "1px";
}
// Ẩn sản phẩm
function hideLi(li) {
  li.style.width = 0;
  li.style.opacity = 0;
  li.style.borderWidth = "0";
}

// Lấy mảng sản phẩm trong trang hiện tại (ở dạng tag html)
function getLiArray() {
  var ul = document.getElementById("products");
  var listLi = ul.getElementsByTagName("li");
  return listLi;
}

// lọc theo tên
function getNameFromLi(li) {
  var a = li.getElementsByTagName("a")[0];
  var h3 = a.getElementsByTagName("h3")[0];
  var name = h3.innerHTML;
  return name;
}

function filterProductsName(ele) {
  var filter = ele.value.toUpperCase();
  var listLi = getLiArray();
  var coSanPham = false;

  var soLuong = 0;

  for (var i = 0; i < listLi.length; i++) {
    if (
      getNameFromLi(listLi[i]).toUpperCase().indexOf(filter) > -1 &&
      soLuong < soLuongSanPhamMaxTrongMotTrang
    ) {
      showLi(listLi[i]);
      coSanPham = true;
      soLuong++;
    } else {
      hideLi(listLi[i]);
    }
  }

  // Thông báo nếu không có sản phẩm
  alertNotHaveProduct(coSanPham);
}

// lọc theo số lượng sao
function getStarFromLi(li) {
  var a = li.getElementsByTagName("a")[0];
  var divRate = a.getElementsByClassName("ratingresult");
  if (!divRate) return 0;

  divRate = divRate[0];
  var starCount = divRate.getElementsByClassName("fa-star").length;

  return starCount;
}

function filterProductsStar(num) {
  var listLi = getLiArray();
  var coSanPham = false;

  for (var i = 0; i < listLi.length; i++) {
    if (getStarFromLi(listLi) >= num) {
      showLi(listLi[i]);
      coSanPham = true;
    } else {
      hideLi(listLi[i]);
    }
  }

  // Thông báo nếu không có sản phẩm
  alertNotHaveProduct(coSanPham);
}

// ================= Hàm khác ==================

// Thêm banner
function addBanner(img, link) {
  var newDiv =
    `<div class='item'>
						<a target='_blank' href=` +
    link +
    `>
							<img src=` +
    img +
    `>
						</a>
					</div>`;
  var banner = document.getElementsByClassName("owl-carousel")[0];
  banner.innerHTML += newDiv;
}

// Thêm hãng sản xuất
function addCompany(img, nameCompany) {
  var link = createLinkFilter("add", "company", nameCompany);
  var new_tag = `<a href=` + link + `><img src=` + img + `></a>`;

  var khung_hangSanXuat = document.getElementsByClassName("companyMenu")[0];
  khung_hangSanXuat.innerHTML += new_tag;
}

// Thêm chọn mức giá
function addPricesRange(min, max) {
  var text = priceToString(min, max);
  var link = createLinkFilter("add", "price", min + "-" + max);

  var mucgia = `<a href="` + link + `">` + text + `</a>`;
  document
    .getElementsByClassName("pricesRangeFilter")[0]
    .getElementsByClassName("dropdown-content")[0].innerHTML += mucgia;
}

// Thêm chọn khuyến mãi
function addPromotion(name) {
  var link = createLinkFilter("add", "promo", name);

  var text = promoToString(name);
  var promo = `<a href="` + link + `">` + text + `</a>`;
  document
    .getElementsByClassName("promosFilter")[0]
    .getElementsByClassName("dropdown-content")[0].innerHTML += promo;
}

// Thêm chọn số lượng sao
function addStarFilter(value) {
  var link = createLinkFilter("add", "star", value);

  var text = starToString(value);
  var star = `<a href="` + link + `">` + text + `</a>`;
  document
    .getElementsByClassName("starFilter")[0]
    .getElementsByClassName("dropdown-content")[0].innerHTML += star;
}

// Thêm chọn sắp xếp theo giá
function addSortFilter(type, nameFilter, text) {
  var link = createLinkFilter("add", "sort", {
    by: nameFilter,
    type: type
  });
  var sortTag = `<a href="` + link + `">` + text + `</a>`;

  document
    .getElementsByClassName("sortFilter")[0]
    .getElementsByClassName("dropdown-content")[0].innerHTML += sortTag;
}

// Chuyển mức giá về dạng chuỗi tiếng việt
function priceToString(min, max) {
  if (min == 0) return "Dưới " + max / 1e6 + " triệu";
  if (max == 0) return "Trên " + min / 1e6 + " triệu";
  return "Từ " + min / 1e6 + " - " + max / 1e6 + " triệu";
}

// Chuyển khuyến mãi vễ dạng chuỗi tiếng việt
function promoToString(name) {
  switch (name) {
    case "tragop":
      return "Trả góp";
    case "giamgia":
      return "Giảm giá";
    case "giareonline":
      return "Giá rẻ online";
    case "moiramat":
      return "Mới ra mắt";
  }
}

// Chuyển số sao về dạng chuỗi tiếng việt
function starToString(star) {
  return "Trên " + (star - 1) + " sao";
}

// Chuyển các loại sắp xếp về dạng chuỗi tiếng việt
function sortToString(sortBy) {
  switch (sortBy) {
    case "price":
      return "Giá ";
    case "star":
      return "Sao ";
    case "rateCount":
      return "Đánh giá ";
    case "name":
      return "Tên ";
    default:
      return "";
  }
}

// Hàm Test, chưa sử dụng
function hideSanPhamKhongThuoc(list) {
  var allLi = getLiArray();
  for (var i = 0; i < allLi.length; i++) {
    var hide = true;
    for (var j = 0; j < list.length; j++) {
      if (getNameFromLi(allLi[i]) == list[j].name) {
        hide = false;
        break;
      }
    }
    if (hide) hideLi(allLi[i]);
  }
}
