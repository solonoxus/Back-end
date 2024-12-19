// API endpoint
const API_URL = "/api";
const ENDPOINTS = {
  // Auth
  LOGIN: "/users/login",
  REGISTER: "/users/register",
  CURRENT_USER: "/users/me",

  // Products
  PRODUCTS: "/products",
  PRODUCT_SEARCH: "/products/search",
  PRODUCT_BY_CODE: "/products/code",
  PRODUCT_RATE: "/products/rate",

  // Cart
  CART: "/cart",

  // Admin
  ADMIN_LOGIN: "/admin/login",
  ADMIN_USERS: "/admin/users",
  ADMIN_PRODUCTS: "/admin/products"
};

// Token management
function setToken(token) {
  localStorage.setItem("token", token);
}

function getToken() {
  return localStorage.getItem("token");
}

// API caller
async function callApi(endpoint, options = {}) {
  try {
    const token = getToken();
    const headers = {
      "Content-Type": "application/json",
      ...options.headers
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Có lỗi xảy ra");
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

// Admin functions
async function adminLogin(username, password) {
  try {
    const { data } = await callApi(ENDPOINTS.ADMIN_LOGIN, {
      method: "POST",
      body: JSON.stringify({ username, password })
    });
    setToken(data.token);
    return data;
  } catch (error) {
    throw new Error(error.message || "Đăng nhập admin thất bại");
  }
}

async function getListAdmin() {
  try {
    const { data } = await callApi(ENDPOINTS.ADMIN_USERS, {
      method: "GET"
    });
    return data.filter((user) => user.isAdmin);
  } catch (error) {
    console.error("Lỗi lấy danh sách admin:", error);
    return [];
  }
}

async function setListAdmin(adminList) {
  try {
    for (const admin of adminList) {
      await callApi(ENDPOINTS.ADMIN_USERS, {
        method: "POST",
        body: JSON.stringify({
          ...admin,
          isAdmin: true
        })
      });
    }
    return true;
  } catch (error) {
    console.error("Lỗi cập nhật danh sách admin:", error);
    return false;
  }
}

// Hàm khởi tạo, tất cả các trang đều cần
async function khoiTao() {
  try {
    setupEventTaiKhoan();
    addEventCloseAlertButton();
    await capNhat_ThongTin_CurrentUser();
  } catch (error) {
    console.error("Lỗi khởi tạo:", error);
    addAlertBox(
      "Có lỗi xảy ra khi khởi tạo ứng dụng.",
      "#dc3545",
      "#fff",
      4000
    );
  }
}

// ========= Các hàm liên quan tới danh sách sản phẩm =========
// Localstorage cho dssp: 'ListProducts
// Products Management
async function getListProducts(options = {}) {
  try {
    const { category, search, sort, order, page, limit } = options;
    const params = new URLSearchParams();

    if (category) params.append("category", category);
    if (search) params.append("search", search);
    if (sort) params.append("sort", sort);
    if (order) params.append("order", order);
    if (page) params.append("page", page);
    if (limit) params.append("limit", limit);

    const data = await callApi(`${ENDPOINTS.PRODUCTS}?${params}`);
    return data.products;
  } catch (error) {
    console.error("Lỗi lấy danh sách sản phẩm:", error);
    return [];
  }
}

async function setListProducts(productList) {
  try {
    // Xóa tất cả sản phẩm cũ
    const currentProducts = await getListProducts();
    for (const product of currentProducts) {
      await callApi(`${ENDPOINTS.ADMIN_PRODUCTS}/${product._id}`, {
        method: "DELETE"
      });
    }

    // Thêm sản phẩm mới
    for (const product of productList) {
      await callApi(ENDPOINTS.ADMIN_PRODUCTS, {
        method: "POST",
        body: JSON.stringify(product)
      });
    }
    return true;
  } catch (error) {
    console.error("Lỗi cập nhật danh sách sản phẩm:", error);
    return false;
  }
}

async function timKiemTheoTen(ten, limit = 10) {
  try {
    const data = await callApi(
      `${ENDPOINTS.PRODUCT_SEARCH}?q=${encodeURIComponent(ten)}&limit=${limit}`
    );
    return data.products;
  } catch (error) {
    console.error("Lỗi tìm kiếm sản phẩm:", error);
    return [];
  }
}

async function timKiemTheoMa(ma) {
  try {
    const data = await callApi(`${ENDPOINTS.PRODUCT_BY_CODE}/${ma}`);
    return data.product;
  } catch (error) {
    console.error("Lỗi tìm kiếm sản phẩm:", error);
    return null;
  }
}

// copy 1 object, do trong js ko có tham biến , tham trị rõ ràng
// nên dùng bản copy để chắc chắn ko ảnh hưởng tới bản chính
function copyObject(o) {
  return JSON.parse(JSON.stringify(o));
}

// ============== ALert Box ===============
// div có id alert được tạo trong hàm addFooter
function addAlertBox(text, bgcolor, textcolor, time) {
  var al = document.getElementById("alert");
  al.childNodes[0].nodeValue = text;
  al.style.backgroundColor = bgcolor;
  al.style.opacity = 1;
  al.style.zIndex = 200;

  if (textcolor) al.style.color = textcolor;
  if (time)
    setTimeout(function () {
      al.style.opacity = 0;
      al.style.zIndex = 0;
    }, time);
}

function addEventCloseAlertButton() {
  document.getElementById("closebtn").addEventListener("mouseover", (event) => {
    // event.target.parentElement.style.display = "none";
    event.target.parentElement.style.opacity = 0;
    event.target.parentElement.style.zIndex = 0;
  });
}

// ================ Cart Number + Thêm vào Giỏ hàng ======================
function animateCartNumber() {
  // Hiệu ứng cho icon giỏ hàng
  var cn = document.getElementsByClassName("cart-number")[0];
  cn.style.transform = "scale(2)";
  cn.style.backgroundColor = "rgba(255, 0, 0, 0.8)";
  cn.style.color = "white";
  setTimeout(function () {
    cn.style.transform = "scale(1)";
    cn.style.backgroundColor = "transparent";
    cn.style.color = "red";
  }, 1200);
}

// Cart Management
async function getCart() {
  try {
    const data = await callApi(ENDPOINTS.CART);
    return data.cart;
  } catch {
    return [];
  }
}

async function themVaoGioHang(masp, tensp) {
  try {
    if (!getToken()) {
      addAlertBox(
        "Bạn cần đăng nhập để thêm vào giỏ hàng.",
        "#dc3545",
        "#fff",
        4000
      );
      showTaiKhoan(true);
      return;
    }

    await callApi(ENDPOINTS.CART, {
      method: "POST",
      body: JSON.stringify({
        productId: masp,
        quantity: 1
      })
    });

    addAlertBox("Đã thêm " + tensp + " vào giỏ.", "#17c671", "#fff", 4000);
    await capNhat_ThongTin_CurrentUser();
    animateCartNumber();
  } catch (error) {
    addAlertBox(
      error.message || "Thêm vào giỏ thất bại.",
      "#dc3545",
      "#fff",
      4000
    );
  }
}

async function updateCart(productId, quantity) {
  try {
    await callApi(ENDPOINTS.CART, {
      method: "PUT",
      body: JSON.stringify({ productId, quantity })
    });
    await capNhat_ThongTin_CurrentUser();
  } catch (error) {
    addAlertBox(
      error.message || "Cập nhật giỏ hàng thất bại.",
      "#dc3545",
      "#fff",
      4000
    );
  }
}

async function removeFromCart(productId) {
  try {
    await callApi(`${ENDPOINTS.CART}/${productId}`, {
      method: "DELETE"
    });
    await capNhat_ThongTin_CurrentUser();
  } catch (error) {
    addAlertBox(
      error.message || "Xóa sản phẩm thất bại.",
      "#dc3545",
      "#fff",
      4000
    );
  }
}

async function clearCart() {
  try {
    await callApi(ENDPOINTS.CART, {
      method: "DELETE"
    });
    await capNhat_ThongTin_CurrentUser();
  } catch (error) {
    addAlertBox(
      error.message || "Xóa giỏ hàng thất bại.",
      "#dc3545",
      "#fff",
      4000
    );
  }
}

async function getTongSoLuongSanPhamTrongGioHang() {
  try {
    const cart = await getCart();
    return cart.reduce((total, item) => total + item.quantity, 0);
  } catch {
    return 0;
  }
}

async function getSoLuongSanPhamTrongUser(productId) {
  try {
    const cart = await getCart();
    const item = cart.find((item) => item.product._id === productId);
    return item ? item.quantity : 0;
  } catch {
    return 0;
  }
}

// ============================== TÀI KHOẢN ============================
// Hàm get set cho người dùng hiện tại đã đăng nhập
async function getCurrentUser() {
  try {
    const data = await callApi(ENDPOINTS.CURRENT_USER);
    return data.user;
  } catch {
    return null;
  }
}

function setCurrentUser(u) {
  window.localStorage.setItem("CurrentUser", JSON.stringify(u));
}

// Hàm lấy danh sách người dùng
async function getListUser() {
  try {
    const data = await callApi(ENDPOINTS.ADMIN_USERS);
    return data.users;
  } catch {
    return [];
  }
}

async function setListUser(userList) {
  try {
    // Xóa tất cả user cũ (trừ admin)
    const currentUsers = await getListUser();
    for (const user of currentUsers) {
      if (!user.isAdmin) {
        await callApi(`${ENDPOINTS.ADMIN_USERS}/${user._id}`, {
          method: "DELETE"
        });
      }
    }

    // Thêm user mới
    for (const user of userList) {
      if (!user.isAdmin) {
        await callApi(ENDPOINTS.REGISTER, {
          method: "POST",
          body: JSON.stringify(user)
        });
      }
    }
    return true;
  } catch (error) {
    console.error("Lỗi cập nhật danh sách user:", error);
    return false;
  }
}

async function updateListUser(userId, newData) {
  try {
    await callApi(`${ENDPOINTS.ADMIN_USERS}/${userId}`, {
      method: "PUT",
      body: JSON.stringify(newData)
    });
    return true;
  } catch (error) {
    console.error("Lỗi cập nhật thông tin user:", error);
    return false;
  }
}

async function logIn(form) {
  try {
    const data = await callApi(ENDPOINTS.LOGIN, {
      method: "POST",
      body: JSON.stringify({
        username: form.username.value,
        password: form.password.value
      })
    });

    setToken(data.token);
    await capNhat_ThongTin_CurrentUser();
    addAlertBox("Đăng nhập thành công.", "#17c671", "#fff", 4000);
    showTaiKhoan(false);
  } catch (error) {
    addAlertBox(
      error.message || "Đăng nhập thất bại.",
      "#dc3545",
      "#fff",
      4000
    );
  }
}

async function signUp(form) {
  try {
    const data = await callApi(ENDPOINTS.REGISTER, {
      method: "POST",
      body: JSON.stringify({
        username: form.username.value,
        password: form.password.value,
        email: form.email.value,
        name: form.name.value
      })
    });

    setToken(data.token);
    await capNhat_ThongTin_CurrentUser();
    addAlertBox("Đăng ký thành công.", "#17c671", "#fff", 4000);
    showTaiKhoan(false);
  } catch (error) {
    addAlertBox(error.message || "Đăng ký thất bại.", "#dc3545", "#fff", 4000);
  }
}

function logOut() {
  localStorage.removeItem("token");
  capNhat_ThongTin_CurrentUser();
  addAlertBox("Đăng xuất thành công.", "#17c671", "#fff", 4000);
}

// Hiển thị form tài khoản, giá trị truyền vào là true hoặc false
function showTaiKhoan(show) {
  var value = show ? "scale(1)" : "scale(0)";
  var div = document.getElementsByClassName("containTaikhoan")[0];
  div.style.transform = value;
}

// Check xem có ai đăng nhập hay chưa (CurrentUser có hay chưa)
// Hàm này chạy khi ấn vào nút tài khoản trên header
function checkTaiKhoan() {
  if (!getCurrentUser()) {
    showTaiKhoan(true);
  }
}

// Tạo event, hiệu ứng cho form tài khoản
function setupEventTaiKhoan() {
  var taikhoan = document.getElementsByClassName("taikhoan")[0];
  var list = taikhoan.getElementsByTagName("input");

  // Tạo eventlistener cho input để tạo hiệu ứng label
  // Gồm 2 event onblur, onfocus được áp dụng cho từng input trong list bên trên
  ["blur", "focus"].forEach(function (evt) {
    for (var i = 0; i < list.length; i++) {
      list[i].addEventListener(evt, function (e) {
        var label = this.previousElementSibling; // lấy element ĐỨNG TRƯỚC this, this ở đây là input
        if (e.type === "blur") {
          // khi ấn chuột ra ngoài
          if (this.value === "") {
            // không có value trong input thì đưa label lại như cũ
            label.classList.remove("active");
            label.classList.remove("highlight");
          } else {
            // nếu có chữ thì chỉ tắt hightlight chứ không tắt active, active là dịch chuyển lên trên
            label.classList.remove("highlight");
          }
        } else if (e.type === "focus") {
          // khi focus thì label active + hightlight
          label.classList.add("active");
          label.classList.add("highlight");
        }
      });
    }
  });

  // Event chuyển tab login-signup
  var tab = document.getElementsByClassName("tab");
  for (var i = 0; i < tab.length; i++) {
    var a = tab[i].getElementsByTagName("a")[0];
    a.addEventListener("click", function (e) {
      e.preventDefault(); // tắt event mặc định

      // Thêm active(màu xanh lá) cho li chứa tag a này => ấn login thì login xanh, signup thì signup sẽ xanh
      this.parentElement.classList.add("active");

      // Sau khi active login thì phải tắt active sigup và ngược lại
      // Trường hợp a này thuộc login => <li>Login</li> sẽ có nextElement là <li>SignUp</li>
      if (this.parentElement.nextElementSibling) {
        this.parentElement.nextElementSibling.classList.remove("active");
      }
      // Trường hợp a này thuộc signup => <li>SignUp</li> sẽ có .previousElement là <li>Login</li>
      if (this.parentElement.previousElementSibling) {
        this.parentElement.previousElementSibling.classList.remove("active");
      }

      // Ẩn phần nhập của login nếu ấn signup và ngược lại
      // href của 2 tab signup và login là #signup và #login -> tiện cho việc getElement dưới đây
      var target = this.href.split("#")[1];
      document.getElementById(target).style.display = "block";

      var hide = target == "login" ? "signup" : "login";
      document.getElementById(hide).style.display = "none";
    });
  }

  // Đoạn code tạo event trên được chuyển về js thuần từ code jquery
  // Code jquery cho phần tài khoản được lưu ở cuối file này
}

// Cập nhật số lượng hàng trong giỏ hàng + Tên current user
async function capNhat_ThongTin_CurrentUser() {
  try {
    const user = await getCurrentUser();
    const nguoidungDiv = document.getElementsByClassName("nguoidung")[0];
    const cartNumberDiv = document.getElementsByClassName("cart-number")[0];

    if (user) {
      nguoidungDiv.innerHTML = user.name || user.username;
      const cart = await getCart();
      cartNumberDiv.innerHTML = cart.reduce(
        (total, item) => total + item.quantity,
        0
      );
    } else {
      nguoidungDiv.innerHTML = "Tài khoản";
      cartNumberDiv.innerHTML = "0";
    }
  } catch (error) {
    console.error("Lỗi cập nhật thông tin:", error);
    // Nếu có lỗi, reset về trạng thái chưa đăng nhập
    document.getElementsByClassName("nguoidung")[0].innerHTML = "Tài khoản";
    document.getElementsByClassName("cart-number")[0].innerHTML = "0";
  }
}

// tính tổng số lượng các sản phẩm của user u truyền vào
function getTongSoLuongSanPhamTrongGioHang(u) {
  var soluong = 0;
  for (var p of u.products) {
    soluong += p.soluong;
  }
  return soluong;
}

// lấy số lương của sản phẩm NÀO ĐÓ của user NÀO ĐÓ được truyền vào
function getSoLuongSanPhamTrongUser(tenSanPham, user) {
  for (var p of user.products) {
    if (p.name == tenSanPham) return p.soluong;
  }
  return 0;
}

// ==================== Những hàm khác =====================
function numToString(num, char) {
  return num
    .toLocaleString()
    .split(",")
    .join(char || ".");
}

function stringToNum(str, char) {
  return Number(str.split(char || ".").join(""));
}

// https://www.w3schools.com/howto/howto_js_autocomplete.asp
function autocomplete(inp, arr) {
  var currentFocus;

  inp.addEventListener("keyup", function (e) {
    if (e.keyCode != 13 && e.keyCode != 40 && e.keyCode != 38) {
      // not Enter,Up,Down arrow
      var a,
        b,
        i,
        val = this.value;

      /*close any already open lists of autocompleted values*/
      closeAllLists();
      if (!val) {
        return false;
      }
      currentFocus = -1;

      /*create a DIV element that will contain the items (values):*/
      a = document.createElement("DIV");
      a.setAttribute("id", this.id + "autocomplete-list");
      a.setAttribute("class", "autocomplete-items");

      /*append the DIV element as a child of the autocomplete container:*/
      this.parentNode.appendChild(a);

      /*for each item in the array...*/
      for (i = 0; i < arr.length; i++) {
        /*check if the item starts with the same letters as the text field value:*/
        if (
          arr[i].name.substr(0, val.length).toUpperCase() == val.toUpperCase()
        ) {
          /*create a DIV element for each matching element:*/
          b = document.createElement("DIV");

          /*make the matching letters bold:*/
          b.innerHTML =
            "<strong>" + arr[i].name.substr(0, val.length) + "</strong>";
          b.innerHTML += arr[i].name.substr(val.length);

          /*insert a input field that will hold the current array item's value:*/
          b.innerHTML += "<input type='hidden' value='" + arr[i].name + "'>";

          /*execute a function when someone clicks on the item value (DIV element):*/
          b.addEventListener("click", function (e) {
            /*insert the value for the autocomplete text field:*/
            inp.value = this.getElementsByTagName("input")[0].value;
            inp.focus();

            /*close the list of autocompleted values,
                        (or any other open lists of autocompleted values:*/
            closeAllLists();
          });
          a.appendChild(b);
        }
      }
    }
  });
  /*execute a function presses a key on the keyboard:*/
  inp.addEventListener("keydown", function (e) {
    var x = document.getElementById(this.id + "autocomplete-list");
    if (x) x = x.getElementsByTagName("div");
    if (e.keyCode == 40) {
      /*If the arrow DOWN key is pressed, increase the currentFocus variable:*/
      currentFocus++;
      /*and and make the current item more visible:*/
      addActive(x);
    } else if (e.keyCode == 38) {
      //up
      /*If the arrow UP key is pressed,
            decrease the currentFocus variable:*/
      currentFocus--;
      /*and and make the current item more visible:*/
      addActive(x);
    } else if (e.keyCode == 13) {
      /*If the ENTER key is pressed, prevent the form from being submitted,*/

      if (currentFocus > -1) {
        /*and simulate a click on the "active" item:*/
        if (x) {
          x[currentFocus].click();
          e.preventDefault();
        }
      }
    }
  });

  function addActive(x) {
    /*a function to classify an item as "active":*/
    if (!x) return false;
    /*start by removing the "active" class on all items:*/
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = x.length - 1;
    /*add class "autocomplete-active":*/
    x[currentFocus].classList.add("autocomplete-active");
  }

  function removeActive(x) {
    /*a function to remove the "active" class from all autocomplete items:*/
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }

  function closeAllLists(elmnt) {
    /*close all autocomplete lists in the document, except the one passed as an argument:*/
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  /*execute a function when someone clicks in the document:*/
  document.addEventListener("click", function (e) {
    closeAllLists(e.target);
  });
}

// Thêm từ khóa tìm kiếm
function addTags(nameTag, link) {
  var new_tag = `<a href=` + link + `>` + nameTag + `</a>`;

  // Thêm <a> vừa tạo vào khung tìm kiếm
  var khung_tags = document.getElementsByClassName("tags")[0];
  khung_tags.innerHTML += new_tag;
}

// Thêm sản phẩm vào trang
function addProduct(p, ele, returnString) {
  promo = new Promo(p.promo.name, p.promo.value); // class Promo
  product = new Product(
    p.masp,
    p.name,
    p.img,
    p.price,
    p.star,
    p.rateCount,
    promo
  ); // Class product

  return addToWeb(product, ele, returnString);
}

// Thêm topnav vào trang
function addTopNav() {
  document.write(`    
	<div class="top-nav group">
        <section>
            <div class="social-top-nav">
                <a class="fa fa-facebook"></a>
                <a class="fa fa-twitter"></a>
                <a class="fa fa-google"></a>
                <a class="fa fa-youtube"></a>
            </div> <!-- End Social Topnav -->

            <ul class="top-nav-quicklink flexContain">
                <li><a href="index.html"><i class="fa fa-home"></i> Trang chủ</a></li>
                <li><a href="tintuc.html"><i class="fa fa-newspaper-o"></i> Tin tức</a></li>
                <li><a href="gioithieu.html"><i class="fa fa-info-circle"></i> Giới thiệu</a></li>
                <li><a href="trungtambaohanh.html"><i class="fa fa-wrench"></i> Bảo hành</a></li>
                <li><a href="lienhe.html"><i class="fa fa-phone"></i> Liên hệ</a></li>
            </ul> <!-- End Quick link -->
        </section><!-- End Section -->
    </div><!-- End Top Nav  -->`);
}

// Thêm header
function addHeader() {
  document.write(`        
	<div class="header group">
        <div class="logo">
            <a href="index.html">
                <img src="img/logo.jpg" alt="Trang chủ Smartphone Store" title="Trang chủ Smartphone Store">
            </a>
        </div> <!-- End Logo -->

        <div class="content">
            <div class="search-header" style="position: relative; left: 162px; top: 1px;">
                <form class="input-search" method="get" action="index.html">
                    <div class="autocomplete">
                        <input id="search-box" name="search" autocomplete="off" type="text" placeholder="Nhập từ khóa tìm kiếm...">
                        <button type="submit">
                            <i class="fa fa-search"></i>
                            Tìm kiếm
                        </button>
                    </div>
                </form> <!-- End Form search -->
                <div class="tags">
                    <strong>Từ khóa: </strong>
                </div>
            </div> <!-- End Search header -->

            <div class="tools-member">
                <div class="member">
                    <a onclick="checkTaiKhoan()">
                        <i class="fa fa-user"></i>
                        Tài khoản
                    </a>
                    <div class="menuMember hide">
                        <a href="nguoidung.html">Trang người dùng</a>
                        <a onclick="if(window.confirm('Xác nhận đăng xuất ?')) logOut();">Đăng xuất</a>
                    </div>

                </div> <!-- End Member -->

                <div class="cart">
                    <a href="giohang.html">
                        <i class="fa fa-shopping-cart"></i>
                        <span>Giỏ hàng</span>
                        <span class="cart-number"></span>
                    </a>
                </div> <!-- End Cart -->

                <!--<div class="check-order">
                    <a>
                        <i class="fa fa-truck"></i>
                        <span>Đơn hàng</span>
                    </a>
                </div> -->
            </div><!-- End Tools Member -->
        </div> <!-- End Content -->
    </div> <!-- End Header -->`);
}

function addFooter() {
  document.write(`
    <!-- Alert Box -->
    <div id="alert">
        <span id="closebtn">&times;</span>
        <p class="alert-text">Hãy đăng ký ngay để nhận ưu đãi hấp dẫn!</p>
    </div>

    <!-- Footer -->
    <footer class="footer">
        <div class="footer-top">
            <div class="footer-col">
                <h4>Hỗ trợ khách hàng</h4>
                <ul>
                    <li><a href="#">Hướng dẫn mua hàng</a></li>
                    <li><a href="#">Phương thức thanh toán</a></li>
                    <li><a href="#">Chính sách bảo hành</a></li>
                    <li><a href="#">Tra cứu đơn hàng</a></li>
                </ul>
            </div>
            <div class="footer-col">
                <h4>Về chúng tôi</h4>
                <ul>
                    <li><a href="#">Giới thiệu</a></li>
                    <li><a href="#">Tuyển dụng</a></li>
                    <li><a href="#">Hệ thống cửa hàng</a></li>
                    <li><a href="#">Liên hệ</a></li>
                </ul>
            </div>
            <div class="footer-col">
                <h4>Kết nối với chúng tôi</h4>
                <ul class="social-links">
                    <li><a class="fa fa-facebook"></a></li>
                    <li><a class="fa fa-twitter"></a></li>
                    <li><a class="fa fa-youtube"></a></a></li>
                    <li><a class="fa fa-instagram"></a></li>
                </ul>
            </div>
            <div class="footer-col">
                <h4>Đăng ký nhận tin</h4>
                <form>
                    <input type="email" placeholder="Nhập email của bạn">
                    <button type="submit">Đăng ký</button>
                </form>
            </div>
        </div>
        <div class="footer-bottom">
            <p>© 2024 Mobile Store - Tất cả các quyền được bảo lưu</p>
        </div>
    </footer>
  `);
}

// Thêm contain Taikhoan
function addContainTaiKhoan() {
  document.write(`
	<div class="containTaikhoan">
        <span class="close" onclick="showTaiKhoan(false);">&times;</span>
        <div class="taikhoan">

            <ul class="tab-group">
                <li class="tab active"><a href="#login">Đăng nhập</a></li>
                <li class="tab"><a href="#signup">Đăng kí</a></li>
            </ul> <!-- /tab group -->

            <div class="tab-content">
                <div id="login">
                    <h1>Chào mừng bạn trở lại!</h1>

                    <form onsubmit="return logIn(this);">

                        <div class="field-wrap">
                            <label>
                                Tên đăng nhập<span class="req">*</span>
                            </label>
                            <input name='username' type="text" required autocomplete="off" />
                        </div> <!-- /user name -->

                        <div class="field-wrap">
                            <label>
                                Mật khẩu<span class="req">*</span>
                            </label>
                            <input name="pass" type="password" required autocomplete="off" />
                        </div> <!-- pass -->

                        <p class="forgot"><a href="#">Quên mật khẩu?</a></p>

                        <button type="submit" class="button button-block" />Tiếp tục</button>

                    </form> <!-- /form -->

                </div> <!-- /log in -->

                <div id="signup">
                    <h1>Đăng kí miễn phí</h1>

                    <form onsubmit="return signUp(this);">

                        <div class="top-row">
                            <div class="field-wrap">
                                <label>
                                    Họ<span class="req">*</span>
                                </label>
                                <input name="ho" type="text" required autocomplete="off" />
                            </div>

                            <div class="field-wrap">
                                <label>
                                    Tên<span class="req">*</span>
                                </label>
                                <input name="ten" type="text" required autocomplete="off" />
                            </div>
                        </div> <!-- / ho ten -->

                        <div class="field-wrap">
                            <label>
                                Địa chỉ Email<span class="req">*</span>
                            </label>
                            <input name="email" type="email" required autocomplete="off" />
                        </div> <!-- /email -->

                        <div class="field-wrap">
                            <label>
                                Tên đăng nhập<span class="req">*</span>
                            </label>
                            <input name="newUser" type="text" required autocomplete="off" />
                        </div> <!-- /user name -->

                        <div class="field-wrap">
                            <label>
                                Mật khẩu<span class="req">*</span>
                            </label>
                            <input name="newPass" type="password" required autocomplete="off" />
                        </div> <!-- /pass -->

                        <button type="submit" class="button button-block" />Tạo tài khoản</button>

                    </form> <!-- /form -->

                </div> <!-- /sign up -->
            </div><!-- tab-content -->

        </div> <!-- /taikhoan -->
    </div>`);
}

// https://stackoverflow.com/a/2450976/11898496
function shuffleArray(array) {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex]
    ];
  }

  return array;
}

function checkLocalStorage() {
  if (typeof Storage == "undefined") {
    alert(
      "Máy tính không hỗ trợ LocalStorage. Không thể lưu thông tin sản phẩm, khách hàng!!"
    );
  } else {
    console.log("LocaStorage OKE!");
  }
}

// Di chuyển lên đầu trang
function gotoTop() {
  if (window.jQuery) {
    jQuery("html,body").animate(
      {
        scrollTop: 0
      },
      100
    );
  } else {
    document.getElementsByClassName("top-nav")[0].scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
  }
}

// Lấy màu ngẫu nhiên
function getRandomColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// Test, not finished
function auto_Get_Database() {
  var ul = document.getElementsByClassName("homeproduct")[0];
  var li = ul.getElementsByTagName("li");
  for (var l of li) {
    var a = l.getElementsByTagName("a")[0];
    // name
    var name = a.getElementsByTagName("h3")[0].innerHTML;

    // price
    var price = a.getElementsByClassName("price")[0];
    price = price.getElementsByTagName("strong")[0].innerHTML;

    // img
    var img = a.getElementsByTagName("img")[0].src;
    console.log(img);
  }
}

function getThongTinSanPhamFrom_TheGioiDiDong() {
  javascript: (function () {
    var s = document.createElement("script");
    s.innerHTML = `
			(function () {
				var ul = document.getElementsByClassName('parameter')[0];
				var li_s = ul.getElementsByTagName('li');
				var result = {};
				result.detail = {};
	
				for (var li of li_s) {
					var loai = li.getElementsByTagName('span')[0].innerText;
					var giatri = li.getElementsByTagName('div')[0].innerText;
	
					switch (loai) {
						case "Màn hình:":
							result.detail.screen = giatri.replace('"', "'");
							break;
						case "Hệ điều hành:":
							result.detail.os = giatri;
							break;
						case "Camera sau:":
							result.detail.camara = giatri;
							break;
						case "Camera trước:":
							result.detail.camaraFront = giatri;
							break;
						case "CPU:":
							result.detail.cpu = giatri;
							break;
						case "RAM:":
							result.detail.ram = giatri;
							break;
						case "Bộ nhớ trong:":
							result.detail.rom = giatri;
							break;
						case "Thẻ nhớ:":
							result.detail.microUSB = giatri;
							break;
						case "Dung lượng pin:":
							result.detail.battery = giatri;
							break;
					}
				}
	
				console.log(JSON.stringify(result, null, "\t"));
			})();`;
    document.body.appendChild(s);
  })();
}
