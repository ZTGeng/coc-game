import { useContext } from "react";
import { LanguageContext } from "../../App";
import { useFlagCheck } from "../../store/slices/flagSlice";

export default function GoToOptions({ options, onOptionSelected }) {
  const flagCheck = useFlagCheck();

  return (
    <div className="d-flex flex-column bg-white" style={{ "--bs-bg-opacity": .8 }}>
      {options
        .filter(option => !option.show || flagCheck(option.show))
        .map(option => <GoToOption key={option.key} {...{ option, onOptionSelected }} />)}
    </div>
  );
}

export function GoToOption({ option, onOptionSelected }) {
  const { autoLang } = useContext(LanguageContext);
  const flagCheck = useFlagCheck();

  const icon = option.secret ? (
    <span className="pe-2">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
        <path d="M7.5 7.25V9h11a2.5 2.5 0 0 1 2.5 2.5v8a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 19.5v-8A2.5 2.5 0 0 1 5.5 9H6V7.25C6 3.845 8.503 1 12 1c2.792 0 4.971 1.825 5.718 4.31a.75.75 0 1 1-1.436.432C15.71 3.84 14.079 2.5 12 2.5c-2.578 0-4.5 2.08-4.5 4.75Zm-3 4.25v8a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-13a1 1 0 0 0-1 1Z"></path>
      </svg>
    </span>
  ) : (
    <span className="pe-2">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
        <path d="M13.22 19.03a.75.75 0 0 1 0-1.06L18.19 13H3.75a.75.75 0 0 1 0-1.5h14.44l-4.97-4.97a.749.749 0 0 1 .326-1.275.749.749 0 0 1 .734.215l6.25 6.25a.75.75 0 0 1 0 1.06l-6.25 6.25a.75.75 0 0 1-1.06 0Z"></path>
      </svg>
    </span>
  );

  return option.disabled && flagCheck(option.disabled) ? (
    <div className="text-body-tertiary h5 p-2">
      { icon }
      { autoLang(option.text) }
    </div>
  ) : (
    <a className={"link link-offset-2 h5 p-2" + (option.secret ? " link-primary": " link-dark")}
      role="button"
      href="#"
      onClick={(e) => { e.preventDefault(); onOptionSelected(option.goto, option.text); }}>
      { icon }
      { autoLang(option.text) }
    </a>
  )
}