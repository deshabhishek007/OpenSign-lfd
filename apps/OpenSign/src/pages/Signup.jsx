import { useEffect, useState } from "react";
import Parse from "parse";
import { NavLink, useNavigate } from "react-router";
import { emailRegex } from "../constant/const";
import Alert from "../primitives/Alert";
import { appInfo } from "../constant/appinfo";
import { getAppLogo, usertimezone } from "../constant/Utils";
import { randomAuthBackground } from "../constant/authBackgrounds";
import { useTranslation } from "react-i18next";

// New self-serve tenant signup — not part of upstream OpenSign, which only
// ever creates a tenant as a side effect of a user's first Google login (see
// the modal further down in Login.jsx). This is a real public signup page
// that reuses the same `usersignup` cloud function (it's provider-agnostic).
// New tenants land on the Free plan (see usersignup.js / plans.js).
function Signup() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: "danger", msg: "" });
  const [logo, setLogo] = useState(appInfo?.applogo);
  const [bgImage] = useState(randomAuthBackground);

  useEffect(() => {
    // Same tenant-branding lookup Login.jsx uses (getlogobydomain, keyed on
    // the current host) — falls back to the generic OpenSign logo if this
    // domain has none set. Peenak's is already configured on partners_Tenant.
    (async () => {
      const app = await getAppLogo();
      if (app?.logo) {
        setLogo(app.logo);
      }
    })();
  }, []);

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
        navigate("/login");
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
      className="min-h-screen w-full flex items-center justify-center relative bg-cover bg-center py-10 px-4"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-black/55 via-black/35 to-black/55" />

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-base-100 text-base-content op-card shadow-2xl p-6 md:p-8 border-t-4 border-t-primary">
          <div className="w-[200px] h-[52px] mb-4 overflow-hidden">
            <img src={logo} className="object-contain h-full" alt="applogo" />
          </div>
          <form onSubmit={handleSubmit} aria-label="Signup Form">
            <h1 className="text-[32px] font-extrabold tracking-tight">{t("signup-heading")}</h1>
            <p className="text-xs text-base-content/60 mb-4">
              {t("signup-subheading")}
            </p>
            <fieldset className="flex flex-col gap-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-base-content/70 mb-1" htmlFor="name">
                  {t("name")}
                </label>
                <input
                  id="name"
                  type="text"
                  className="op-input op-input-bordered op-input-md w-full text-sm"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-base-content/70 mb-1" htmlFor="company">
                  {t("company")}
                </label>
                <input
                  id="company"
                  type="text"
                  className="op-input op-input-bordered op-input-md w-full text-sm"
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-base-content/70 mb-1" htmlFor="email">
                  {t("email")}
                </label>
                <input
                  id="email"
                  type="email"
                  className="op-input op-input-bordered op-input-md w-full text-sm"
                  name="email"
                  autoComplete="username"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-base-content/70 mb-1" htmlFor="password">
                  {t("password")}
                </label>
                <input
                  id="password"
                  type="password"
                  className="op-input op-input-bordered op-input-md w-full text-sm"
                  name="password"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-base-content/70 mb-1" htmlFor="confirmPassword">
                  {t("signup-confirm-password")}
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  className="op-input op-input-bordered op-input-md w-full text-sm"
                  name="confirmPassword"
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </fieldset>
            <button
              type="submit"
              className="op-btn op-btn-primary w-full mt-4 text-base font-bold"
              disabled={loading}
            >
              {loading ? t("loading") : t("signup-create-account")}
            </button>
            <div className="mt-3 text-xs text-center">
              {t("signup-have-account")}{" "}
              <NavLink
                to="/login"
                className="op-link op-link-primary underline-offset-1"
              >
                {t("login")}
              </NavLink>
            </div>
          </form>
        </div>
        {alert.msg && <Alert type={alert.type}>{alert.msg}</Alert>}
      </div>
    </div>
  );
}

export default Signup;
