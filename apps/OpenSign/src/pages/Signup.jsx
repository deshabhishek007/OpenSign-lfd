import { useState } from "react";
import Parse from "parse";
import { NavLink, useNavigate } from "react-router";
import login_img from "../assets/images/login_img.svg";
import { useWindowSize } from "../hook/useWindowSize";
import { emailRegex } from "../constant/const";
import Alert from "../primitives/Alert";
import { appInfo } from "../constant/appinfo";
import { usertimezone } from "../constant/Utils";
import { useTranslation } from "react-i18next";

// New self-serve tenant signup — not part of upstream OpenSign, which only
// ever creates a tenant as a side effect of a user's first Google login (see
// the modal further down in Login.jsx). This is a real public signup page
// that reuses the same `usersignup` cloud function (it's provider-agnostic).
// New tenants land on the Free plan (see usersignup.js / plans.js).
function Signup() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { width } = useWindowSize();
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: "danger", msg: "" });

  const handleChange = (event) => {
    let { name, value } = event.target;
    if (name === "email") {
      value = value?.toLowerCase()?.replace(/\s/g, "");
    }
    setForm({ ...form, [name]: value });
  };

  const showToast = (type, msg) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert({ type: "danger", msg: "" }), 3000);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!emailRegex.test(form.email)) {
      showToast("danger", t("valid-email-alert"));
      return;
    }
    if (form.password.length < 6) {
      showToast("danger", t("signup-password-too-short"));
      return;
    }
    if (form.password !== form.confirmPassword) {
      showToast("danger", t("signup-passwords-must-match"));
      return;
    }
    setLoading(true);
    try {
      const res = await Parse.Cloud.run("usersignup", {
        userDetails: {
          name: form.name,
          email: form.email,
          password: form.password,
          company: form.company,
          role: "contracts_Admin", // founding user of a new org = its admin
          timezone: usertimezone
        }
      });
      if (res?.sessionToken) {
        localStorage.setItem("accesstoken", res.sessionToken);
        // Login.jsx's own mount effect picks up accesstoken and does the
        // full post-login resolution (extUser, tenant, role-based redirect)
        // — reusing that instead of duplicating it here.
        navigate("/");
      } else if (res?.message === "User already exist") {
        showToast("danger", t("signup-account-exists"));
      } else {
        showToast("danger", t("something-went-wrong-mssg"));
      }
    } catch (error) {
      console.error("signup error", error);
      showToast("danger", t("something-went-wrong-mssg"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      aria-labelledby="signupHeading"
      role="region"
      className="pb-1 md:pb-4 pt-10 md:px-10 lg:px-16 h-full"
    >
      <div className="md:p-4 lg:p-10 p-4 bg-base-100 text-base-content op-card">
        <div className="w-[250px] h-[66px] inline-block overflow-hidden">
          <img
            src={appInfo?.applogo}
            className="object-contain h-full"
            alt="applogo"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-2">
          <div>
            <form onSubmit={handleSubmit} aria-label="Signup Form">
              <h1 className="text-[30px] mt-6">{t("signup-heading")}</h1>
              <fieldset>
                <legend className="text-[12px] text-[#878787]">
                  {t("signup-subheading")}
                </legend>
                <div className="w-full px-6 py-3 my-1 op-card bg-base-100 shadow-md outline outline-1 outline-slate-300/50">
                  <label className="block text-xs" htmlFor="name">
                    {t("name")}
                  </label>
                  <input
                    id="name"
                    type="text"
                    className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                  <hr className="my-1 border-none" />
                  <label className="block text-xs" htmlFor="company">
                    {t("company")}
                  </label>
                  <input
                    id="company"
                    type="text"
                    className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
                    name="company"
                    value={form.company}
                    onChange={handleChange}
                    required
                  />
                  <hr className="my-1 border-none" />
                  <label className="block text-xs" htmlFor="email">
                    {t("email")}
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
                    name="email"
                    autoComplete="username"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                  <hr className="my-1 border-none" />
                  <label className="block text-xs" htmlFor="password">
                    {t("password")}
                  </label>
                  <input
                    id="password"
                    type="password"
                    className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
                    name="password"
                    autoComplete="new-password"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                  <hr className="my-1 border-none" />
                  <label className="block text-xs" htmlFor="confirmPassword">
                    {t("signup-confirm-password")}
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
                    name="confirmPassword"
                    autoComplete="new-password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </fieldset>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-center text-xs font-bold mt-2">
                <button
                  type="submit"
                  className="op-btn op-btn-primary"
                  disabled={loading}
                >
                  {loading ? t("loading") : t("signup-create-account")}
                </button>
              </div>
              <div className="mt-3 text-xs">
                {t("signup-have-account")}{" "}
                <NavLink
                  to="/"
                  className="op-link op-link-primary underline-offset-1"
                >
                  {t("login")}
                </NavLink>
              </div>
            </form>
          </div>
          {width >= 768 && (
            <div className="place-self-center">
              <div className="mx-auto md:w-[300px] lg:w-[400px] xl:w-[500px]">
                <img src={login_img} alt="" width="100%" />
              </div>
            </div>
          )}
        </div>
      </div>
      {alert.msg && <Alert type={alert.type}>{alert.msg}</Alert>}
    </div>
  );
}

export default Signup;
