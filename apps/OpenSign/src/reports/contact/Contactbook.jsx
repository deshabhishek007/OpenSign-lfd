import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import EditContactForm from "./EditContactForm";
import ModalUi from "../../primitives/ModalUi";
import Alert from "../../primitives/Alert";
import EmptyState from "../../primitives/EmptyState";
import Tooltip from "../../primitives/Tooltip";
import Loader from "../../primitives/Loader";
import { serverUrl_fn } from "../../constant/appinfo";
import { useElSize } from "../../hook/useElSize";
import ImportContact from "./ImportContact";
import AddContact from "../../primitives/AddContact";
import { withSessionValidation } from "../../utils";

const Contactbook = (props) => {
  const titleRef = useRef(null);
  const titleElement = useElSize(titleRef);
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [actLoader, setActLoader] = useState({});
  const [isContactform, setIsContactform] = useState(false);
  const [isDeleteModal, setIsDeleteModal] = useState({});
  const [alertMsg, setAlertMsg] = useState({ type: "success", message: "" });
  const [isModal, setIsModal] = useState({});
  const [contact, setContact] = useState({
    Name: "",
    Email: "",
    Phone: "",
    JobTitle: "",
    Company: ""
  });
  const [sortOrder, setSortOrder] = useState("asc");
  // Two-pane master/detail: which contact is open in the right-hand pane,
  // and whether that pane is in inline-edit mode.
  const [selectedId, setSelectedId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const startIndex = (currentPage - 1) * props.docPerPage;
  const { isMoreDocs, setIsNextRecord } = props;

  useEffect(() => {
    if (props.isSearchResult) {
      setCurrentPage(1);
    }
  }, [props.isSearchResult]);

  const getPaginationRange = () => {
    const totalPageNumbers = 7; // Adjust this value to show more/less page numbers
    const pages = [];
    const totalPages = Math.ceil(props.List.length / props.docPerPage);
    if (totalPages <= totalPageNumbers) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const leftSiblingIndex = Math.max(currentPage - 1, 1);
      const rightSiblingIndex = Math.min(currentPage + 1, totalPages);

      const showLeftDots = leftSiblingIndex > 2;
      const showRightDots = rightSiblingIndex < totalPages - 2;

      const firstPageIndex = 1;
      const lastPageIndex = totalPages;

      if (!showLeftDots && showRightDots) {
        let leftItemCount = 3;
        let leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);

        pages.push(...leftRange);
        pages.push("...");
        pages.push(totalPages);
      } else if (showLeftDots && !showRightDots) {
        let rightItemCount = 3;
        let rightRange = Array.from(
          { length: rightItemCount },
          (_, i) => totalPages - rightItemCount + i + 1
        );

        pages.push(firstPageIndex);
        pages.push("...");
        pages.push(...rightRange);
      } else if (showLeftDots && showRightDots) {
        let middleRange = Array.from(
          { length: 3 },
          (_, i) => leftSiblingIndex + i
        );

        pages.push(firstPageIndex);
        pages.push("...");
        pages.push(...middleRange);
        pages.push("...");
        pages.push(lastPageIndex);
      }
    }

    return pages;
  };
  const showAlert = (type, message, time = 1500) => {
    setAlertMsg({ type: type, message: message });
    setTimeout(() => setAlertMsg({ type: "", message: "" }), time);
  };
  const pageNumbers = getPaginationRange();
  //  below useEffect reset currenpage to 1 if user change route
  useEffect(() => {
    return () => setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // below useEffect is used to render next record if IsMoreDoc is true
  // second last value of pageNumber array is same as currentPage
  useEffect(() => {
    if (isMoreDocs && pageNumbers[pageNumbers.length - 1] === currentPage) {
      setIsNextRecord(true);
    }
  }, [isMoreDocs, pageNumbers, currentPage, setIsNextRecord]);

  // Get current list
  const indexOfLastDoc = currentPage * props.docPerPage;
  const indexOfFirstDoc = indexOfLastDoc - props.docPerPage;
  const sortedList = React.useMemo(() => {
    const contacts = [...props.List];
    contacts.sort((a, b) => {
      const nameA = a?.Name?.toLowerCase() || "";
      const nameB = b?.Name?.toLowerCase() || "";
      if (nameA < nameB) return sortOrder === "asc" ? -1 : 1;
      if (nameA > nameB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return contacts;
  }, [props.List, sortOrder]);

  const currentList = sortedList?.slice(indexOfFirstDoc, indexOfLastDoc);

  // The contact currently open in the detail pane (derived from the live
  // list so edits/deletes flow through). Clear the pane if that contact
  // leaves the list (deleted, or filtered out by a search).
  const selectedContact =
    props.List?.find((x) => x.objectId === selectedId) || null;
  useEffect(() => {
    if (selectedId && !props.List?.some((x) => x.objectId === selectedId)) {
      setSelectedId(null);
      setIsEditing(false);
    }
  }, [props.List, selectedId]);

  const getInitials = (name) => {
    const parts = (name || "").trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "?";
    return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
  };

  const openContact = (item) => {
    setSelectedId(item.objectId);
    setIsEditing(false);
  };

  // Change page
  const paginateFront = () => {
    const lastValue = pageNumbers?.[pageNumbers?.length - 1];
    if (currentPage < lastValue) {
      setCurrentPage(currentPage + 1);
    }
  };

  const paginateBack = () => {
    if (startIndex > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleContactFormModal = () => {
    setIsContactform(!isContactform);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const handleUserData = (data) => {
    props.setList((prevData) => [data, ...prevData]);
    showAlert("success", t("contact-saved"));
  };

  const handleDelete = withSessionValidation(async (item) => {
    setIsDeleteModal({});
    setActLoader({ [`${item.objectId}`]: true });
    try {
      const serverUrl = serverUrl_fn();
      const cls = "contracts_Contactbook";
      const url = serverUrl + `/classes/${cls}/`;
      const body = { IsDeleted: true };
      const res = await axios.put(url + item.objectId, body, {
        headers: {
          "Content-Type": "application/json",
          "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
          "X-Parse-Session-Token": localStorage.getItem("accesstoken")
        }
      });
      if (res.data && res.data.updatedAt) {
        setActLoader({});
        showAlert("success", t("record-delete-alert"));
        const upldatedList = props.List.filter(
          (x) => x.objectId !== item.objectId
        );
        props.setList(upldatedList);
        // close the detail pane if the deleted contact was open
        if (selectedId === item.objectId) {
          setSelectedId(null);
          setIsEditing(false);
        }
      }
    } catch (err) {
      console.log("err", err);
      showAlert("danger", t("something-went-wrong-mssg"));
      setActLoader({});
    }
  });
  const handleClose = () => {
    setIsDeleteModal({});
  };

  // `handleImportBtn` is trigger when user click on upload icon from contactbook
  const handleImportBtn = () => {
    setIsModal({ export: true });
  };

  // `handleEditContact` is used to update contactas per old contact Id
  const handleEditContact = async (updateContact) => {
    const updateList = props.List.map((x) =>
      x.objectId === contact.objectId ? { ...x, ...updateContact } : x
    );
    props.setList(updateList);
  };
  const handleCloseModal = () => {
    setActLoader({});
    setIsModal({});
  };
  return (
    <div className="relative">
      {Object.keys(actLoader)?.length > 0 && (
        <div className="absolute w-full h-full flex justify-center items-center bg-black/30 rounded-box z-30">
          <Loader />
        </div>
      )}
      <div className="p-2 w-full bg-base-100 text-base-content op-card shadow-lg">
        {alertMsg.message && (
          <Alert type={alertMsg.type}>{alertMsg.message}</Alert>
        )}
        <div
          ref={titleRef}
          className="flex flex-row items-center justify-between my-2 mx-3 text-[20px] md:text-[23px]"
        >
          <div className="font-light">
            {t(`report-name.Contactbook`)}{" "}
            {props.report_help && (
              <span className="text-xs md:text-[13px] font-normal">
                <Tooltip
                  id="report_help"
                  message="t(`report-help.Contactbook`)"
                />
              </span>
            )}
          </div>
          <div className="flex flex-row justify-center items-center gap-3 mb-2">
            {/* Search input for report bigger in width */}
            {titleElement?.width > 500 && (
              <div className="flex">
                <input
                  type="search"
                  value={props.searchTerm}
                  onChange={props.handleSearchChange}
                  placeholder={t("search-contacts")}
                  onPaste={props.handleSearchPaste}
                  className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-64 text-xs"
                />
              </div>
            )}
            {/* import contact icon */}
            <div
              className="cursor-pointer flex"
              onClick={() => handleImportBtn()}
            >
              <i className="fa-solid fa-upload text-[23px] md:text-[25px]"></i>
            </div>
            {/* add contact icon*/}
            <div
              className="cursor-pointer flex"
              onClick={() => handleContactFormModal()}
            >
              <i className="fa-solid fa-square-plus text-accent text-[30px] md:text-[32px]"></i>
            </div>
            {/* search icon/magnifer icon */}
            {titleElement?.width < 500 && (
              <button
                className="flex justify-center items-center focus:outline-none rounded-md text-[18px]"
                aria-label="Search"
                onClick={() =>
                  props.setMobileSearchOpen(!props.mobileSearchOpen)
                }
              >
                <i className="fa-solid fa-magnifying-glass"></i>
              </button>
            )}
          </div>
        </div>
        {/* Search input for report smalle in width */}
        {titleElement?.width < 500 && props.mobileSearchOpen && (
          <div className="top-full left-0 w-full px-3 pt-1 pb-3">
            <input
              type="search"
              value={props.searchTerm}
              onChange={props.handleSearchChange}
              placeholder={t("search-documents")}
              onPaste={props.handleSearchPaste}
              className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
            />
          </div>
        )}
        {props.searchLoader || props.List?.length <= 0 ? (
          /* Full-width loader / empty state (no list to split into panes) */
          <div className="flex flex-col items-center justify-center w-full bg-base-100 text-base-content rounded-xl py-8 min-h-[300px]">
            {props.searchLoader ? (
              <>
                <Loader />
                <div className="text-sm">{t("loading-mssg")}</div>
              </>
            ) : props.searchTerm ? (
              <EmptyState
                icon="fa-magnifying-glass"
                title={t("no-results-for-search", { term: props.searchTerm })}
              />
            ) : (
              <EmptyState
                icon="fa-address-book"
                title={t("empty-state.no-contacts-title")}
                description={t("empty-state.no-contacts-desc")}
                actionLabel={t("add-contact")}
                onAction={() => handleContactFormModal()}
              />
            )}
          </div>
        ) : (
          /* Two-pane master/detail */
          <div className="flex flex-col md:flex-row border-t border-base-300 min-h-[440px]">
            {/* LEFT — contact list */}
            <div
              className={`md:w-[320px] md:shrink-0 md:border-r border-base-300 flex-col ${
                selectedContact ? "hidden md:flex" : "flex"
              }`}
            >
              <div className="flex items-center justify-between px-3 py-2 border-b border-base-300">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-base-content/50">
                  {props.List.length} {t("report-name.Contactbook")}
                </span>
                <button
                  type="button"
                  onClick={toggleSortOrder}
                  className="op-btn op-btn-ghost op-btn-xs text-base-content/70"
                  title={t("name")}
                >
                  <i
                    className={
                      sortOrder === "asc"
                        ? "fa-solid fa-arrow-down-a-z"
                        : "fa-solid fa-arrow-up-a-z"
                    }
                  ></i>
                </button>
              </div>
              <div className="flex-1 overflow-auto">
                {currentList.map((item) => {
                  const active = item.objectId === selectedId;
                  return (
                    <button
                      key={item.objectId}
                      type="button"
                      onClick={() => openContact(item)}
                      className={`w-full text-left flex items-center gap-3 px-3 py-2.5 border-b border-base-300/60 transition-colors ${
                        active ? "bg-primary/10" : "hover:bg-base-200"
                      }`}
                    >
                      <span
                        className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold ${
                          active
                            ? "bg-primary text-primary-content"
                            : "bg-base-300 text-base-content/70"
                        }`}
                      >
                        {getInitials(item?.Name)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className={`block text-sm font-medium truncate ${
                            active ? "text-primary" : "text-base-content"
                          }`}
                        >
                          {item?.Name || "-"}
                        </span>
                        <span className="block text-xs text-base-content/50 truncate">
                          {item?.Email || "-"}
                        </span>
                      </span>
                      <i
                        className={`fa-solid fa-chevron-right text-[10px] shrink-0 ${
                          active ? "text-primary" : "text-base-content/25"
                        }`}
                      ></i>
                    </button>
                  );
                })}
              </div>
              {props.List.length > props.docPerPage && (
                <div className="op-join flex flex-wrap items-center justify-center p-2 border-t border-base-300">
                  <button
                    onClick={() => paginateBack()}
                    className="op-join-item op-btn op-btn-xs"
                  >
                    {t("prev")}
                  </button>
                  {pageNumbers.map((x, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(x)}
                      disabled={x === "..."}
                      className={`${
                        x === currentPage ? "op-btn-active" : ""
                      } op-join-item op-btn op-btn-xs`}
                    >
                      {x}
                    </button>
                  ))}
                  <button
                    onClick={() => paginateFront()}
                    className="op-join-item op-btn op-btn-xs"
                  >
                    {t("next")}
                  </button>
                </div>
              )}
            </div>

            {/* RIGHT — detail pane */}
            <div
              className={`flex-1 flex-col ${
                selectedContact ? "flex" : "hidden md:flex"
              }`}
            >
              {selectedContact ? (
                isEditing ? (
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 px-4 pt-3">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="op-btn op-btn-ghost op-btn-xs gap-1"
                      >
                        <i className="fa-solid fa-arrow-left"></i> {t("cancel")}
                      </button>
                      <span className="text-sm font-semibold">
                        {t("edit-contact")}
                      </span>
                    </div>
                    <EditContactForm
                      contact={selectedContact}
                      handleClose={() => setIsEditing(false)}
                      handleEditContact={handleEditContact}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col p-5">
                    <button
                      type="button"
                      onClick={() => setSelectedId(null)}
                      className="op-btn op-btn-ghost op-btn-xs gap-1 self-start mb-3 md:hidden"
                    >
                      <i className="fa-solid fa-arrow-left"></i> {t("back")}
                    </button>
                    <div className="flex items-center gap-4 mb-5">
                      <span className="shrink-0 w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold">
                        {getInitials(selectedContact?.Name)}
                      </span>
                      <div className="min-w-0">
                        <div className="text-lg font-semibold text-base-content truncate">
                          {selectedContact?.Name || "-"}
                        </div>
                        {(selectedContact?.JobTitle ||
                          selectedContact?.Company) && (
                          <div className="text-sm text-base-content/60 truncate">
                            {[
                              selectedContact?.JobTitle,
                              selectedContact?.Company
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </div>
                        )}
                      </div>
                    </div>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mb-6">
                      {[
                        ["email", selectedContact?.Email, "fa-envelope"],
                        ["phone", selectedContact?.Phone, "fa-phone"],
                        ["company", selectedContact?.Company, "fa-building"],
                        ["job-title", selectedContact?.JobTitle, "fa-briefcase"]
                      ].map(([key, val, icon]) => (
                        <div key={key} className="flex items-start gap-3">
                          <i
                            className={`fa-solid ${icon} text-base-content/40 mt-0.5 w-4 text-center`}
                          ></i>
                          <div className="min-w-0">
                            <dt className="text-[11px] uppercase tracking-wide text-base-content/50">
                              {t(key)}
                            </dt>
                            <dd className="text-sm text-base-content break-words">
                              {val || "—"}
                            </dd>
                          </div>
                        </div>
                      ))}
                    </dl>
                    <div className="flex gap-2 border-t border-base-300 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setContact(selectedContact);
                          setIsEditing(true);
                        }}
                        className="op-btn op-btn-primary op-btn-sm gap-1"
                      >
                        <i className="fa-solid fa-pen"></i> {t("edit")}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setIsDeleteModal({ [selectedContact.objectId]: true })
                        }
                        className="op-btn op-btn-ghost op-btn-sm gap-1 text-error"
                      >
                        <i className="fa-solid fa-trash"></i> {t("delete")}
                      </button>
                    </div>
                  </div>
                )
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                  <div className="w-14 h-14 rounded-full bg-base-200 flex items-center justify-center mb-3">
                    <i className="fa-solid fa-address-card text-xl text-base-content/40"></i>
                  </div>
                  <div className="text-sm font-semibold text-base-content">
                    {t("contact-detail-empty-title")}
                  </div>
                  <p className="text-xs text-base-content/60 mt-1 max-w-xs">
                    {t("contact-detail-empty-desc")}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add contact modal */}
        <ModalUi
          title={t("add-contact")}
          isOpen={isContactform}
          handleClose={handleContactFormModal}
        >
          <AddContact
            isDisableTitle
            isAddYourSelfCheckbox
            details={handleUserData}
            closePopup={handleContactFormModal}
          />
        </ModalUi>
        {/* Bulk import modal */}
        <ModalUi
          isOpen={isModal?.export}
          title={t("bulk-import")}
          handleClose={handleCloseModal}
        >
          <div className="relative">
            {Object.keys(actLoader)?.length > 0 && (
              <div className="absolute w-full h-full flex justify-center items-center bg-black bg-opacity-30 z-30">
                <Loader />
              </div>
            )}
            <ImportContact
              setLoader={setActLoader}
              onImport={handleCloseModal}
              showAlert={showAlert}
            />
          </div>
        </ModalUi>
        {/* Delete confirm — single, driven by the selected contact */}
        {selectedContact && isDeleteModal[selectedContact.objectId] && (
          <ModalUi
            isOpen
            title={t("delete-contact")}
            handleClose={handleClose}
          >
            <div className="m-[20px]">
              <div className="text-lg font-normal text-base-content">
                {t("contact-delete-alert")}
              </div>
              <hr className="bg-base-300 mt-3" />
              <div className="flex items-center mt-3 gap-2">
                <button
                  onClick={() => handleDelete(selectedContact)}
                  className="w-[100px] op-btn op-btn-primary"
                >
                  {t("yes")}
                </button>
                <button
                  onClick={handleClose}
                  className="w-[100px] op-btn op-btn-secondary"
                >
                  {t("no")}
                </button>
              </div>
            </div>
          </ModalUi>
        )}
      </div>
    </div>
  );
};

export default Contactbook;
