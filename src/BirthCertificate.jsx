import React, { useRef, useState, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import { useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./BirthCertificate.css";

export default function BirthCertificate() {
  const printRef = useRef();

  const emptyForm = {
    localBody: "",
    mandal: "",
    district: "",
    name: "",
    sex: "",
    dob: "",
    placeOfBirth: "",
    motherName: "",
    fatherName: "",
    birthAddr1: "",
    birthAddr2: "",
    birthAddr3: "",
    birthAddr4: "",

    permanentAddr1: "",
    permanentAddr2: "",
    permanentAddr3: "",
    permanentAddr4: "",

    regNo: "",
    regDate: "",
    remarks: "",
  };

  const navigate = useNavigate();

  const [f, setF] = useState(() => {
    const saved = localStorage.getItem("birthCertDraft");
    return saved ? JSON.parse(saved) : emptyForm;
  });

  const [sameAddress, setSameAddress] = useState(false);
  const [locked, setLocked] = useState(false);

  const LIMITS = {
    localBody: 40,
    mandal: 40,
    district: 40,
    name: 60,
    placeOfBirth: 60,
    motherName: 60,
    fatherName: 60,

    birthAddr1: 30,
    birthAddr2: 30,
    birthAddr3: 30,
    birthAddr4: 30,

    permanentAddr1: 30,
    permanentAddr2: 30,
    permanentAddr3: 30,
    permanentAddr4: 30,

    regNo: 30,
    remarks: 60,
  };

  const clearDraft = () => localStorage.removeItem("birthCertDraft");

  useEffect(() => {
    localStorage.setItem("birthCertDraft", JSON.stringify(f));
  }, [f]);

  useEffect(() => {
    if (sameAddress) {
      setF((p) => ({
        ...p,
        permanentAddr1: p.birthAddr1,
        permanentAddr2: p.birthAddr2,
        permanentAddr3: p.birthAddr3,
        permanentAddr4: p.birthAddr4,
      }));
    }
  }, [sameAddress, f.birthAddr1, f.birthAddr2, f.birthAddr3, f.birthAddr4]);

  useEffect(() => {
    if (!f.regDate && !locked) {
      const today = new Date().toISOString().split("T")[0];
      setF((p) => ({ ...p, regDate: today }));
    }
  }, []);

  useEffect(() => {
    if (!sameAddress) {
      setF((p) => ({
        ...p,
        permanentAddr1: "",
        permanentAddr2: "",
        permanentAddr3: "",
        permanentAddr4: "",
      }));
    }
  }, [sameAddress]);

  const onChange = (e) => {
    const { name, value, selectionStart } = e.target;
    const limit = LIMITS[name];

    const newValue = typeof value === "string" ? value.toUpperCase() : value;

    if (limit && newValue.length > limit) return;

    setF((p) => ({ ...p, [name]: newValue }));

    requestAnimationFrame(() => {
      e.target.setSelectionRange(selectionStart, selectionStart);
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const els = Array.from(e.target.form.elements);
      els[els.indexOf(e.target) + 1]?.focus();
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    onAfterPrint: () => {
      clearDraft();
      setLocked(false);
    },
  });

  const getFirstName = (name = "") => {
    return name.trim().split(" ")[0] || "BIRTH_CERT";
  };

  const getDobYear = (dob = "") => {
    return dob ? dob.split("-")[0] : "YEAR";
  };

  const exportPDF = () => {
    const firstName = getFirstName(f.name);
    const dobYear = getDobYear(f.dob);

    const fileName = `${firstName}_${dobYear}.pdf`;

    html2pdf()
      .from(printRef.current)
      .set({
        filename: fileName,
        jsPDF: { format: "a4", unit: "mm" },
        html2canvas: { scale: 3 },
      })
      .save()
      .then(() => {
        clearDraft();
        setLocked(false);
      });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  };

  return (
    <div className="layout">
      <div className="form-with-btn">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="back-btn"
        >
          ← Back to Certificates
        </button>
        <form className="form-ui">
          <h2>Birth Certificate Form</h2>

          {[
            ["Local Body", "localBody"],
            ["Mandal", "mandal"],
            ["District", "district"],
            ["Name", "name"],
          ].map(([label, name]) => (
            <React.Fragment key={name}>
              <label>{label}</label>
              <input
                name={name}
                value={f[name]}
                onChange={onChange}
                onKeyDown={handleKeyDown}
                disabled={locked}
              />
            </React.Fragment>
          ))}

          <label>Sex</label>
          <div className="radio-group">
            {["MALE", "FEMALE"].map((s) => (
              <label key={s}>
                <input
                  type="radio"
                  name="sex"
                  value={s}
                  checked={f.sex === s}
                  onChange={onChange}
                  disabled={locked}
                />
                {s}
              </label>
            ))}
          </div>

          <label>Date of Birth</label>
          <DatePicker
            selected={f.dob ? new Date(f.dob) : null}
            onChange={(date) =>
              setF((p) => ({
                ...p,
                dob: date ? date.toISOString().split("T")[0] : "",
              }))
            }
            dateFormat="dd/MM/yyyy"
            showYearDropdown
            showMonthDropdown
            dropdownMode="select"
            yearDropdownItemNumber={100}
            scrollableYearDropdown
            maxDate={new Date()}
            placeholderText="DD / MM / YYYY"
            disabled={locked}
            portalId="root"
          />

          {[
            ["Place of Birth", "placeOfBirth"],
            ["Name of Mother", "motherName"],
            ["Name of Father", "fatherName"],
          ].map(([label, name]) => (
            <React.Fragment key={name}>
              <label>{label}</label>
              <input
                name={name}
                value={f[name]}
                onChange={onChange}
                disabled={locked}
              />
            </React.Fragment>
          ))}

          <label>Address at time of Birth</label>

          <input
            name="birthAddr1"
            placeholder="House No / Street"
            value={f.birthAddr1}
            onChange={onChange}
            disabled={locked}
          />

          <input
            name="birthAddr2"
            placeholder="Locality / Landmark"
            value={f.birthAddr2}
            onChange={onChange}
            disabled={locked}
          />

          <input
            name="birthAddr3"
            placeholder="Village / Mandal"
            value={f.birthAddr3}
            onChange={onChange}
            disabled={locked}
          />

          <input
            name="birthAddr4"
            placeholder="District - PIN"
            value={f.birthAddr4}
            onChange={onChange}
            disabled={locked}
          />

          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={sameAddress}
                disabled={locked}
                onChange={(e) => setSameAddress(e.target.checked)}
              />
              Permanent address same as birth address
            </label>
          </div>

          <label>Permanent Address</label>

          {["1", "2", "3", "4"].map((n) => (
            <input
              key={n}
              name={`permanentAddr${n}`}
              placeholder={
                [
                  "House No / Street",
                  "Locality / Landmark",
                  "Village / Mandal",
                  "District - PIN",
                ][n - 1]
              }
              value={f[`permanentAddr${n}`]}
              onChange={onChange}
              disabled={locked || sameAddress}
            />
          ))}

          <label>Registration No</label>
          <input
            name="regNo"
            value={f.regNo}
            onChange={onChange}
            disabled={locked}
          />

          <label>Date of Registration</label>
          <DatePicker
            selected={f.regDate ? new Date(f.regDate) : null}
            onChange={(date) =>
              setF((p) => ({
                ...p,
                regDate: date ? date.toISOString().split("T")[0] : "",
              }))
            }
            dateFormat="dd/MM/yyyy"
            showYearDropdown
            showMonthDropdown
            dropdownMode="select"
            yearDropdownItemNumber={50}
            scrollableYearDropdown
            maxDate={new Date()}
            placeholderText="DD / MM / YYYY"
            disabled={locked}
            portalId="root"
          />

          <label>Remarks</label>
          <input
            name="remarks"
            value={f.remarks}
            onChange={onChange}
            disabled={locked}
          />
        </form>
        <div className="btns">
          <button
            type="button"
            className="print"
            onClick={() => {
              setLocked(true);

              setTimeout(handlePrint, 100);
            }}
          >
            Print
          </button>

          <button
            type="button"
            className="pdf"
            onClick={() => {
              setLocked(true);

              setTimeout(exportPDF, 100);
            }}
          >
            Export
          </button>

          <button
            type="button"
            className="clear"
            onClick={() => {
              setF(emptyForm);
              setSameAddress(false);
              setLocked(false);
              clearDraft();
            }}
          >
            Clear Form
          </button>
        </div>
      </div>

      {/* Certificate */}

      <div className="preview-wrap">
        <div ref={printRef} className="page">
          <div className="center">FORM NO.5</div>
          <div className="center">GOVERNMENT OF ANDHRA PRADESH</div>
          <div className="center">MEDICAL & HEALTH DEPARTMENT</div>
          <div className="center title">BIRTH CERTIFICATE</div>

          <div className="sub">
            (Issued under section 12 / 17 of the Registration of Births and
            Deaths Act, 1969 and Rule 8 / 13 of the Andhra Pradesh Registration
            of Births and Deaths Rules, 1999)
          </div>

          <div className="content">
            This is to certify that the following information has been taken
            from the original record of birth, which is in the register for{" "}
            <span className="line">{f.localBody}</span> (Local area / local
            body) of Mandal <span className="line">{f.mandal}</span> of District{" "}
            <span className="line">{f.district}</span>. of State Andhra Pradesh
            State.
          </div>

          <table>
            <tbody>
              <tr>
                <td>Name</td>
                <td>
                  : <span className="line">{f.name}</span>
                </td>
              </tr>
              <tr>
                <td>Sex</td>
                <td>
                  : <span className="line">{f.sex}</span>
                </td>
              </tr>
              <tr>
                <td>Date of Birth</td>
                <td>
                  : <span className="line">{formatDate(f.dob)}</span>
                </td>
              </tr>
              <tr>
                <td>Place of Birth</td>
                <td>
                  : <span className="line">{f.placeOfBirth}</span>
                </td>
              </tr>
              <tr>
                <td>Name of Mother</td>
                <td>
                  : <span className="line">{f.motherName}</span>
                </td>
              </tr>
              <tr>
                <td>Name of Father</td>
                <td>
                  : <span className="line">{f.fatherName}</span>
                </td>
              </tr>
            </tbody>
          </table>

          <div className="addr">
            <div className="box">
              Address at Birth
              {[f.birthAddr1, f.birthAddr2, f.birthAddr3, f.birthAddr4].map(
                (line, i) => (
                  <div key={i} className="dot">
                    {line}
                  </div>
                ),
              )}
            </div>
            <div className="box">
              Permanent Address
              {[
                f.permanentAddr1,
                f.permanentAddr2,
                f.permanentAddr3,
                f.permanentAddr4,
              ].map((line, i) => (
                <div key={i} className="dot">
                  {line}
                </div>
              ))}
            </div>
          </div>

          <div className="footer">
            Registration No. <span className="line">{f.regNo}</span>
            <br />
            Date of Registration{" "}
            <span className="line">{formatDate(f.regDate)}</span>
            <br />
            Remarks <span className="line">{f.remarks}</span>
          </div>

          <div className="signature">Signature of Issuing Authority</div>
        </div>
      </div>
    </div>
  );
}
