//加入 vue-loading-overlay 套件
// import Loading from "vue-loading-overlay";
// import "vue-loading-overlay/dist/vue-loading.css";

const apiUrl = "https://vue3-course-api.hexschool.io/v2";
const apiPath = "hsiaoi";

//加入全部規則
Object.keys(VeeValidateRules).forEach((rule) => {
  if (rule !== "default") {
    VeeValidate.defineRule(rule, VeeValidateRules[rule]);
  }
});

// 讀取外部的資源
VeeValidateI18n.loadLocaleFromURL("./zh_TW.json");

// Activate the locale
VeeValidate.configure({
  generateMessage: VeeValidateI18n.localize("zh_TW"),
  validateOnInput: true, // 調整為：輸入文字時，就立即進行驗證
});

const app = Vue.createApp({
  data() {
    return {
      products: [],
      cartData: {
        carts: [],
      },
      productId: "",
      isLoadingItem: "",
      form: {
        user: {
          name: "",
          email: "",
          tel: "",
          address: "",
        },
        message: "",
      },
      // isLoading: false,
    };
  },
  methods: {
    getProduct() {
      axios
        .get(`${apiUrl}/api/${apiPath}/products/all`)
        .then((res) => {
          // console.log(res);
          this.products = res.data.products;
        })
        .catch((err) => {
          alert(err.data.message);
        });
    },
    openProductModal(id) {
      this.$refs.productModal.openModal();

      this.productId = id;
    },
    //取得購物車列表
    getCart() {
      axios
        .get(`${apiUrl}/api/${apiPath}/cart`)
        .then((res) => {
          // console.log(res);
          this.cartData = res.data.data;
          // console.log(this.cartData);
        })
        .catch((err) => {
          alert(err.data.message);
        });
    },
    //加入購物車
    addToCart(id, qty = 1) {
      const data = {
        product_id: id,
        qty,
      };
      this.isLoadingItem = id;
      axios
        .post(`${apiUrl}/api/${apiPath}/cart`, { data })
        .then((res) => {
          // console.log(res);
          this.getCart();
          this.isLoadingItem = "";
          this.$refs.productModal.closeModal();
        })
        .catch((err) => {
          alert(err.data.message);
        });
    },
    //更新購物車內數量
    updateCartItem(cart) {
      const data = {
        product_id: cart.id,
        qty: cart.qty,
      };
      this.isLoadingItem = cart.id;
      axios
        .put(`${apiUrl}/api/${apiPath}/cart/${cart.id}`, { data })
        .then((res) => {
          // console.log(res);
          this.getCart();
          this.isLoadingItem = "";
        })
        .catch((err) => {
          alert(err.data.message);
        });
    },
    //刪除購物車資料
    removeCartItem(id) {
      axios
        .delete(`${apiUrl}/api/${apiPath}/cart/${id}`)
        .then((res) => {
          // console.log(res);
          this.getCart();
          this.isLoadingItem = "";
        })
        .catch((err) => {
          alert(err.data.message);
        });
    },

    //清除全部購物車
    removeCartAll() {
      axios
        .delete(`${apiUrl}/api/${apiPath}/carts`)
        .then((res) => {
          // console.log(res);
          this.getCart();
        })
        .catch((err) => {
          alert(err.data.message);
        });
    },
    //送出訂單資料
    sendOrder() {
      const order = this.form;
      axios
        .post(`${apiUrl}/api/${apiPath}/order`, { data: order })
        .then((res) => {
          // console.log(res);
          //送出訂單後清空表單資料
          this.$refs.form.resetForm();
          this.getCart();
          alert("成功送出訂單！");
        })
        .catch((err) => {
          alert(err.data.message);
        });
    },
    //讀取效果
    // addLoading() {
    //   this.isLoading = true;
    //   // simulate AJAX
    //   setTimeout(() => {
    //     this.isLoading = false;
    //   }, 1000);
    // },
  },
  mounted() {
    this.getProduct();
    this.getCart();
  },
});

app.component("product-modal", {
  template: "#userProductModal",
  props: ["id"],
  data() {
    return {
      modal: {},
      product: {},
      qty: 1,
    };
  },
  //每次 id 有變動時要再取得一次資料
  watch: {
    id() {
      this.getProduct();
    },
  },
  methods: {
    //查看更多取得資料
    getProduct() {
      axios
        .get(`${apiUrl}/api/${apiPath}/product/${this.id}`)
        .then((res) => {
          console.log(res);
          this.product = res.data.product;
        })
        .catch((err) => {
          alert(err.data.message);
        });
    },
    //加入物購物車
    addToCart() {
      this.$emit("add-cart", this.product.id, this.qty);
    },
    openModal() {
      this.modal.show();
    },
    closeModal() {
      this.modal.hide();
    },
  },
  //開啟 product modal，使用 bootstrap
  mounted() {
    this.modal = new bootstrap.Modal(this.$refs.modal);
  },
});

// app.component("Loading", VueLoading.Component);
app.component("VForm", VeeValidate.Form);
app.component("VField", VeeValidate.Field);
app.component("ErrorMessage", VeeValidate.ErrorMessage);

app.mount("#app");
