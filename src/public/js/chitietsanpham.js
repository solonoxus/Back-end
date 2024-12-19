var nameProduct, maProduct, sanPhamHienTai; // Tên sản phẩm trong trang này,
// là biến toàn cục để có thể dùng ở bát cứ đâu trong trang
// không cần tính toán lấy tên từ url nhiều lần

window.onload = async function () {
  try {
      await khoiTao();

      // Thêm tags vào khung tìm kiếm
      const tags = ["Samsung", "iPhone", "Vivo", "Oppo"];
      for (const t of tags) {
          addTags(t, "index.html?search=" + t, true);
      }

      await phanTich_URL_chiTietSanPham();

      // Thêm gợi ý sản phẩm
      if (sanPhamHienTai) {
          await suggestion();
      }
  } catch (error) {
      console.error('Lỗi khởi tạo trang:', error);
  }
};

// Hiển thị thông báo không tìm thấy sản phẩm
function khongTimThaySanPham() {
  document.getElementById("productNotFound").style.display = "block";
  document.getElementsByClassName("chitietSanpham")[0].style.display = "none";
}

async function getProductDetail(productCode) {
  try {
      const response = await callApi(`${ENDPOINTS.PRODUCT_BY_CODE}/${productCode}`);
      return response.data;
  } catch (error) {
      console.error('Lỗi khi lấy thông tin sản phẩm:', error);
      return null;
  }
}


async function phanTich_URL_chiTietSanPham() {
  const urlParams = new URLSearchParams(window.location.search);
  const productCode = urlParams.get('code');
  
  if (!productCode) return khongTimThaySanPham();

  try {
      sanPhamHienTai = await getProductDetail(productCode);
      if (!sanPhamHienTai) return khongTimThaySanPham();

      nameProduct = sanPhamHienTai.name;
      maProduct = sanPhamHienTai.code;

      var divChiTiet = document.getElementsByClassName("chitietSanpham")[0];

      // Đổi title
      document.title = nameProduct + " - Thế giới điện thoại";

      // Cập nhật tên h1
      var h1 = divChiTiet.getElementsByTagName("h1")[0];
      h1.innerHTML += nameProduct;

      // Cập nhật sao
      var rating = "";
      if (sanPhamHienTai.rateCount > 0) {
          for (var i = 1; i <= 5; i++) {
              if (i <= sanPhamHienTai.star) {
                  rating += `<i class="fa fa-star"></i>`;
              } else {
                  rating += `<i class="fa fa-star-o"></i>`;
              }
          }
          rating += `<span> ${sanPhamHienTai.rateCount} đánh giá</span>`;
      }
      divChiTiet.getElementsByClassName("rating")[0].innerHTML += rating;

      // Cập nhật giá + label khuyến mãi
      var price = divChiTiet.getElementsByClassName("area_price")[0];
      if (sanPhamHienTai.promo?.name !== "giareonline") {
          price.innerHTML = `<strong>${sanPhamHienTai.price}₫</strong>`;
          if (sanPhamHienTai.promo) {
              price.innerHTML += new Promo(
                  sanPhamHienTai.promo.name,
                  sanPhamHienTai.promo.value
              ).toWeb();
          }
      } else {
          document.getElementsByClassName("ship")[0].style.display = ""; 
          price.innerHTML = `<strong>${sanPhamHienTai.promo.value}₫</strong>
                          <span>${sanPhamHienTai.price}₫</span>`;
      }

      // Cập nhật chi tiết khuyến mãi
      document.getElementById("detailPromo").innerHTML = getDetailPromo(sanPhamHienTai);

      // Cập nhật thông số
      var info = document.getElementsByClassName("info")[0];
      var s = addThongSo("Màn hình", sanPhamHienTai.detail.screen);
      s += addThongSo("Hệ điều hành", sanPhamHienTai.detail.os);
      s += addThongSo("Camara sau", sanPhamHienTai.detail.camara);
      s += addThongSo("Camara trước", sanPhamHienTai.detail.camaraFront);
      s += addThongSo("CPU", sanPhamHienTai.detail.cpu);
      s += addThongSo("RAM", sanPhamHienTai.detail.ram);
      s += addThongSo("Bộ nhớ trong", sanPhamHienTai.detail.rom);
      s += addThongSo("Thẻ nhớ", sanPhamHienTai.detail.microUSB);
      s += addThongSo("Dung lượng pin", sanPhamHienTai.detail.battery);
      info.innerHTML = s;

      // Cập nhật hình
      var hinh = divChiTiet.getElementsByClassName("picture")[0];
      hinh.innerHTML = `<img src="${sanPhamHienTai.img}" onclick="opencertain()">`;

      // Thêm các hình nhỏ
      addSmallImg(sanPhamHienTai.img);

  } catch (error) {
      console.error('Lỗi khi xử lý thông tin sản phẩm:', error);
      khongTimThaySanPham();
  }
}


function getDetailPromo(sp) {
  if (!sp.promo) return "";
  
  switch (sp.promo.name) {
      case "tragop":
          return `Khách hàng có thể mua trả góp sản phẩm với <span style="font-weight: bold">lãi suất ${sp.promo.value}%</span> với thời hạn 6 tháng kể từ khi mua hàng.`;

      case "giamgia":
          return `Khách hàng sẽ được giảm <span style="font-weight: bold">${sp.promo.value}₫</span> khi tới mua trực tiếp tại cửa hàng`;

      case "moiramat":
          return `Khách hàng sẽ được thử máy miễn phí tại cửa hàng. Có thể đổi trả lỗi trong vòng 2 tháng.`;

      case "giareonline":
          const del = stringToNum(sp.price) - stringToNum(sp.promo.value);
          return `Sản phẩm sẽ được giảm <span style="font-weight: bold">${numToString(del)}₫</span> khi mua hàng online bằng thẻ VPBank hoặc tin nhắn SMS`;

      default:
          return `Cơ hội trúng <span style="font-weight: bold">61 xe Wave Alpha</span> khi trả góp Home Credit`;
  }
}

function addThongSo(ten, giatri) {
  return `<li>
      <p>${ten}</p>
      <div>${giatri}</div>
  </li>`;
}

// add hình
function addSmallImg(img) {
  const newDiv = `<div class="item">
      <a>
          <img src="${img}" onclick="changepic(this.src)">
      </a>
  </div>`;
  document.getElementsByClassName("list-hinhnho")[0].innerHTML += newDiv;
}

// đóng mở xem hình
function opencertain() {
  document.getElementById("overlaycertainimg").style.transform = "scale(1)";
}

function closecertain() {
  document.getElementById("overlaycertainimg").style.transform = "scale(0)";
}

// đổi hình trong chế độ xem hình
function changepic(src) {
  document.getElementById("bigimg").src = src;
}

// Thêm sản phẩm vào các khung sản phẩm
async function addKhungSanPham(list_sanpham, tenKhung, color, ele) {
  try {
      const response = await callApi(`${ENDPOINTS.PRODUCTS}/category/${tenKhung}`);
      const products = response.data;

      let s = `<div class="khungSanPham" style="border-color: ${color}">
          <h3 class="tenKhung" style="background-color: ${color}">${tenKhung}</h3>
          <div class="listSpTrongKhung flexContain">`;

      for (const p of products) {
          s += addProduct(p, null, true);
      }

      s += `</div>
      </div>`;

      ele.innerHTML += s;
  } catch (error) {
      console.error(`Lỗi khi thêm khung sản phẩm ${tenKhung}:`, error);
  }
}

/// gợi ý sản phẩm

async function suggestion() {
  try {
      const response = await callApi(`${ENDPOINTS.PRODUCTS}/suggestions?code=${maProduct}`);
      const relatedProducts = response.data;
      
      if (relatedProducts.length) {
          // Thêm các sản phẩm tương tự
          let div = document.getElementById("goiYSanPham");
          let s = `<div class="khungSanPham" style="border-color: #434aa8">
              <h3 class="tenKhung" style="background-color: #434aa8">Bạn có thể thích</h3>
              <div class="listSpTrongKhung flexContain">`;
          
          for (const sp of relatedProducts) {
              s += addProduct(sp, null, true);
          }

          s += `</div></div>`;
          div.innerHTML = s;
      }
  } catch (error) {
      console.error('Lỗi khi lấy gợi ý sản phẩm:', error);
  }
}