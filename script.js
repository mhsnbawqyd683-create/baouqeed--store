// إعدادات مشروع Supabase (المفتاح Publishable عام ومخصص للواجهة)
const SUPABASE_URL = "https://ygsdutrdujvdzusluplr.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable__66Olcvc3H6ee_6wAhmFOw_NzvMlgEt";
const WHATSAPP = "967779563062";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const starterProducts = [
  {id:"starter-1",name:"طباعة الأكواب",category:"printing",price:4000,description:"طباعة الصور والأسماء والشعارات على الأكواب.",image_url:"",is_active:true},
  {id:"starter-2",name:"طباعة الملابس",category:"printing",price:0,description:"طباعة مخصصة على الملابس حسب الطلب.",image_url:"",is_active:true},
  {id:"starter-3",name:"ملصقات المنتجات",category:"printing",price:0,description:"ملصقات لمنتجات المحلات والمشاريع.",image_url:"",is_active:true},
  {id:"starter-4",name:"كروت العمل",category:"printing",price:27500,description:"تصميم وطباعة كروت العمل حسب الكمية.",image_url:"",is_active:true},
  {id:"starter-5",name:"كروت التوزيعات",category:"printing",price:0,description:"كروت أنيقة للمناسبات والتوزيعات.",image_url:"",is_active:true},
  {id:"starter-6",name:"تصميم شعار وهوية",category:"design",price:0,description:"تصميم شعار وهوية بصرية لمشروعك.",image_url:"",is_active:true},
  {id:"starter-7",name:"تصميم سيرة ذاتية",category:"design",price:0,description:"إعداد وتصميم سيرة ذاتية احترافية.",image_url:"",is_active:true},
  {id:"starter-8",name:"تصميم دعوات المناسبات",category:"design",price:0,description:"دعوات للمناسبات بتصميم حسب رغبتك.",image_url:"",is_active:true},
  {id:"starter-9",name:"أكياس قماشية",category:"services",price:0,description:"توفير وتجهيز أكياس قماشية حسب الطلب.",image_url:"",is_active:true},
  {id:"starter-10",name:"أكياس بلاستيكية",category:"services",price:0,description:"أكياس للمحلات والمشاريع حسب الطلب.",image_url:"",is_active:true},
  {id:"starter-11",name:"هدايا مخصصة",category:"gifts",price:0,description:"هدايا بالأسماء والصور والشعارات.",image_url:"",is_active:true},
  {id:"starter-12",name:"مطبوعات المؤسسات",category:"institutions",price:0,description:"كروت وملفات ومراسلات ومطبوعات للجهات والمؤسسات.",image_url:"",is_active:true}
];
const categoryNames = {printing:"الطباعة",design:"التصميم",services:"الخدمات",gifts:"الهدايا",institutions:"المؤسسات"};
const $ = id => document.getElementById(id);
let products = [];
let cart = readLocal("baouqeed_cart", []);
let adminMode = false;
let activeFilter = "all";
let editingProductId = null;

function readLocal(key, fallback) {
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; }
  catch { return fallback; }
}
function money(value) {
  return Number(value) > 0 ? Number(value).toLocaleString("en-US") + " ر.ي" : "حسب الطلب";
}
function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
}
function status(message, isError = false) {
  $("adminStatus").textContent = message || "";
  $("adminStatus").classList.toggle("error", Boolean(isError));
}
async function loadProducts() {
  const {data, error} = await supabaseClient.from("products").select("*").order("created_at", {ascending:false});
  if (error) {
    console.error(error);
    products = [];
    $("emptyState").hidden = false;
    $("emptyState").textContent = "تعذر تحميل المنتجات. تأكد من تنفيذ إعداد قاعدة البيانات في ملف SQL.";
    return;
  }
  products = data || [];
  renderProducts();
  if (adminMode) renderAdminProducts();
}
function renderProducts() {
  const shown = products.filter(product => product.is_active && (activeFilter === "all" || product.category === activeFilter));
  $("productGrid").innerHTML = shown.map(product => `
    <article class="product-card">
      <button class="delete-product" data-delete="${escapeHtml(product.id)}" aria-label="حذف المنتج">حذف</button>
      <button class="edit-product" data-edit="${escapeHtml(product.id)}" aria-label="تعديل المنتج">تعديل</button>
      <div class="product-image">${product.image_url ? `<img src="${escapeHtml(product.image_url)}" alt="${escapeHtml(product.name)}" loading="lazy">` : "✧"}</div>
      <div class="product-info"><h3>${escapeHtml(product.name)}</h3><p>${escapeHtml(product.description || "متوفر حسب الطلب")}</p>
        <div class="product-meta"><span class="price">${money(product.price)}</span><button class="add-cart" data-add="${escapeHtml(product.id)}">أضف للسلة</button></div>
      </div>
    </article>`).join("");
  $("emptyState").hidden = shown.length > 0;
  if (!shown.length) $("emptyState").textContent = "لا توجد منتجات في هذا القسم حاليًا.";
}
function renderAdminProducts() {
  $("adminProducts").innerHTML = products.map(product => `
    <div class="admin-product-row">
      <div><strong>${escapeHtml(product.name)}</strong><small>${categoryNames[product.category] || product.category} · ${money(product.price)} · <span class="${product.is_active ? "" : "status-hidden"}">${product.is_active ? "ظاهر للزوار" : "مخفي"}</span></small></div>
      <div class="admin-product-actions">
        <button data-admin-edit="${escapeHtml(product.id)}">تعديل</button>
        <button data-toggle="${escapeHtml(product.id)}">${product.is_active ? "إخفاء" : "إظهار"}</button>
        <button class="danger" data-admin-delete="${escapeHtml(product.id)}">حذف</button>
      </div>
    </div>`).join("") || '<p class="muted">لا توجد منتجات محفوظة بعد.</p>';
}
function renderCart() {
  $("cartCount").textContent = cart.reduce((sum, item) => sum + item.qty, 0);
  $("cartItems").innerHTML = cart.length ? cart.map(item => `
    <div class="cart-row"><span>${escapeHtml(item.name)} × ${item.qty}<br><b>${money(item.price * item.qty)}</b></span>
    <span><button data-remove="${escapeHtml(item.id)}">حذف</button></span></div>`).join("") : "<p class='muted'>السلة فارغة حاليًا.</p>";
  const total = cart.reduce((sum, item) => sum + (Number(item.price) || 0) * item.qty, 0);
  $("cartTotal").textContent = total.toLocaleString("en-US") + " ر.ي";
  localStorage.setItem("baouqeed_cart", JSON.stringify(cart));
}
function resetProductForm() {
  $("productForm").reset();
  $("pId").value = "";
  editingProductId = null;
  $("saveProductBtn").textContent = "إضافة المنتج";
  $("cancelEditBtn").hidden = true;
}
async function uploadProductImage(file) {
  if (!file) return null;
  if (!file.type.startsWith("image/")) throw new Error("الملف المحدد ليس صورة.");
  if (file.size > 5 * 1024 * 1024) throw new Error("حجم الصورة أكبر من 5 ميجابايت.");
  const extension = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${crypto.randomUUID()}.${extension}`;
  const {error} = await supabaseClient.storage.from("product-images").upload(path, file, {cacheControl:"3600", upsert:false});
  if (error) throw error;
  const {data} = supabaseClient.storage.from("product-images").getPublicUrl(path);
  return data.publicUrl;
}
async function isAdminUser() {
  const {data:{user}, error:userError} = await supabaseClient.auth.getUser();
  if (userError || !user) return false;
  const {data, error} = await supabaseClient.from("admin_users").select("id").eq("id", user.id).maybeSingle();
  if (error) {
    console.error(error);
    return false;
  }
  return Boolean(data);
}
async function login() {
  const email = $("adminEmail").value.trim();
  const password = $("adminPassword").value;
  if (!email || !password) { $("loginError").textContent = "أدخل البريد الإلكتروني وكلمة المرور."; return; }
  $("loginBtn").disabled = true;
  $("loginError").textContent = "";
  const {error} = await supabaseClient.auth.signInWithPassword({email, password});
  $("loginBtn").disabled = false;
  if (error) { $("loginError").textContent = "تعذر تسجيل الدخول. تحقق من البريد وكلمة المرور."; return; }
  const allowed = await isAdminUser();
  if (!allowed) {
    await supabaseClient.auth.signOut();
    $("loginError").textContent = "هذا الحساب ليس مضافًا كمدير للمتجر.";
    return;
  }
  adminMode = true;
  document.body.classList.add("admin-mode");
  $("loginArea").hidden = true;
  $("adminArea").hidden = false;
  $("adminWelcome").textContent = "تم تسجيل الدخول إلى لوحة الإدارة";
  status("أهلًا بك. يمكنك إدارة المنتجات الآن.");
  await loadProducts();
}
async function logout() {
  await supabaseClient.auth.signOut();
  adminMode = false;
  document.body.classList.remove("admin-mode");
  $("loginArea").hidden = false;
  $("adminArea").hidden = true;
  $("adminPassword").value = "";
  resetProductForm();
  status("تم تسجيل الخروج.");
}
function startEdit(id) {
  const product = products.find(item => String(item.id) === String(id));
  if (!product) return;
  editingProductId = product.id;
  $("pId").value = product.id;
  $("pName").value = product.name || "";
  $("pCategory").value = product.category;
  $("pPrice").value = Number(product.price) || 0;
  $("pImage").value = product.image_url || "";
  $("pDescription").value = product.description || "";
  $("saveProductBtn").textContent = "حفظ التعديلات";
  $("cancelEditBtn").hidden = false;
  $("productForm").scrollIntoView({behavior:"smooth", block:"start"});
}
async function saveProduct(event) {
  event.preventDefault();
  if (!adminMode) return;
  const name = $("pName").value.trim();
  if (!name) return;
  const wasEditing = Boolean(editingProductId);
  const submit = $("saveProductBtn");
  submit.disabled = true;
  status("جارٍ حفظ المنتج...");
  try {
    let imageUrl = $("pImage").value.trim();
    const file = $("pFile").files[0];
    if (file) imageUrl = await uploadProductImage(file);
    const payload = {
      name,
      category: $("pCategory").value,
      price: Number($("pPrice").value) || 0,
      description: $("pDescription").value.trim(),
      image_url: imageUrl || null
    };
    let result;
    if (editingProductId) {
      result = await supabaseClient.from("products").update(payload).eq("id", editingProductId);
    } else {
      result = await supabaseClient.from("products").insert(payload);
    }
    if (result.error) throw result.error;
    resetProductForm();
    await loadProducts();
    status(wasEditing ? "تم تحديث المنتج بنجاح." : "تمت إضافة المنتج وحفظه في قاعدة البيانات.");
  } catch (error) {
    console.error(error);
    status(error.message || "تعذر حفظ المنتج. راجع إعدادات قاعدة البيانات والتخزين.", true);
  } finally {
    submit.disabled = false;
  }
}
async function toggleProduct(id) {
  const product = products.find(item => String(item.id) === String(id));
  if (!product) return;
  const {error} = await supabaseClient.from("products").update({is_active:!product.is_active}).eq("id", product.id);
  if (error) { status("تعذر تغيير حالة المنتج: " + error.message, true); return; }
  await loadProducts();
  status(product.is_active ? "تم إخفاء المنتج من واجهة المتجر." : "تم إظهار المنتج للزوار.");
}
async function deleteProduct(id) {
  if (!confirm("هل تريد حذف هذا المنتج نهائيًا؟")) return;
  const {error} = await supabaseClient.from("products").delete().eq("id", id);
  if (error) { status("تعذر حذف المنتج: " + error.message, true); return; }
  await loadProducts();
  status("تم حذف المنتج.");
}

document.addEventListener("click", async event => {
  const add = event.target.closest("[data-add]");
  if (add) {
    const product = products.find(item => String(item.id) === String(add.dataset.add));
    if (product) {
      const found = cart.find(item => String(item.id) === String(product.id));
      found ? found.qty++ : cart.push({...product, qty:1});
      renderCart();
      $("cartOverlay").classList.add("show");
    }
  }
  const remove = event.target.closest("[data-remove]");
  if (remove) { cart = cart.filter(item => String(item.id) !== String(remove.dataset.remove)); renderCart(); }
  const edit = event.target.closest("[data-edit], [data-admin-edit]");
  if (edit && adminMode) {
    $("adminOverlay").classList.add("show");
    $("loginArea").hidden = true;
    $("adminArea").hidden = false;
    startEdit(edit.dataset.edit || edit.dataset.adminEdit);
  }
  const del = event.target.closest("[data-delete], [data-admin-delete]");
  if (del && adminMode) await deleteProduct(del.dataset.delete || del.dataset.adminDelete);
  const toggle = event.target.closest("[data-toggle]");
  if (toggle && adminMode) await toggleProduct(toggle.dataset.toggle);
});

$("filters").addEventListener("click", event => {
  const button = event.target.closest("[data-filter]");
  if (!button) return;
  activeFilter = button.dataset.filter;
  document.querySelectorAll(".filter").forEach(item => item.classList.toggle("active", item === button));
  renderProducts();
});
$("cartOpen").onclick = () => $("cartOverlay").classList.add("show");
$("cartClose").onclick = () => $("cartOverlay").classList.remove("show");
$("cartOverlay").addEventListener("click", event => { if (event.target === $("cartOverlay")) $("cartOverlay").classList.remove("show"); });
$("checkout").onclick = () => {
  if (!cart.length) { alert("أضف منتجات إلى السلة أولًا."); return; }
  const lines = cart.map(item => `- ${item.name} | الكمية: ${item.qty} | السعر: ${money(item.price * item.qty)}`);
  const total = cart.reduce((sum, item) => sum + (Number(item.price) || 0) * item.qty, 0);
  const message = `السلام عليكم، أرغب بطلب المنتجات التالية من متجر باوقيد:\n${lines.join("\n")}\nالإجمالي المعروف: ${total.toLocaleString("en-US")} ر.ي\nيرجى تأكيد الأسعار وتفاصيل الطلب.`;
  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`, "_blank", "noopener");
};
$("adminOpen").onclick = async () => {
  $("adminOverlay").classList.add("show");
  const {data:{session}} = await supabaseClient.auth.getSession();
  if (session && await isAdminUser()) {
    adminMode = true;
    document.body.classList.add("admin-mode");
    $("loginArea").hidden = true;
    $("adminArea").hidden = false;
    await loadProducts();
  } else {
    $("loginArea").hidden = false;
    $("adminArea").hidden = true;
  }
};
$("adminClose").onclick = () => $("adminOverlay").classList.remove("show");
$("adminOverlay").addEventListener("click", event => { if (event.target === $("adminOverlay")) $("adminOverlay").classList.remove("show"); });
$("loginBtn").onclick = login;
$("logoutBtn").onclick = logout;
$("productForm").addEventListener("submit", saveProduct);
$("cancelEditBtn").onclick = resetProductForm;
$("menuToggle").onclick = () => $("mainNav").classList.toggle("open");
document.querySelectorAll("#mainNav a").forEach(link => link.onclick = () => $("mainNav").classList.remove("open"));
$("year").textContent = new Date().getFullYear();

renderCart();
loadProducts();
