import React from "react";
import { useNavigate } from "react-router";
import { openInNewTab } from "../../constant/Utils";
import { useTranslation } from "react-i18next";

const DashboardButton = (props) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  function openReport() {
    if (props.Data && props.Data.Redirect_type) {
      const Redirect_type = props.Data.Redirect_type;
      const id = props.Data.Redirect_id;
      if (Redirect_type === "Form") {
        navigate(`/form/${id}`);
      } else if (Redirect_type === "Report") {
        navigate(`/report/${id}`);
      } else if (Redirect_type === "Url") {
        openInNewTab(id);
      }
    }
  }
  return (
    <div
      onClick={() => openReport()}
      className={`${
        props.Data && props.Data.Redirect_type
          ? "cursor-pointer"
          : "cursor-default"
      } group w-full op-card bg-base-100 border border-base-content/10 px-4 py-4 transition-all hover:border-primary/40 hover:shadow-lg hover:-translate-y-0.5`}
    >
      <div className="flex flex-row items-center text-base-content">
        <div className="flex flex-row items-center">
          <span className="rounded-xl bg-primary/10 text-primary w-14 h-14 self-start flex justify-center items-center shrink-0 transition-colors group-hover:bg-primary group-hover:text-primary-content">
            <i
              className={`${
                props.Icon ? props.Icon : "fa-solid fa-info"
              } text-2xl`}
            ></i>
          </span>
        </div>
        <div className="ml-4">
          <div className="text-lg font-semibold">
            {t(`sidebar.${props.Label}`)}
          </div>
          {props.Label === "Sign yourself" && (
            <div className="text-base-content/60 text-xs mt-0.5">
              {t("signyour-self-button")}
            </div>
          )}
          {props.Label === "Request signatures" && (
            <div className="text-base-content/60 text-xs mt-0.5">
              {t("requestsign-button")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardButton;
