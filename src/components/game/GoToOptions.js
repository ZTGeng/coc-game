import { useContext } from "react";
import { FlagsContext } from "../Game";
import { LanguageContext } from "../../App";

export default function GoToOptions({ chapterKey, options, nextChapter }) {
  const { flagConditionCheck } = useContext(FlagsContext);

  return options
    .filter(option => !option.show || flagConditionCheck(option.show))
    .map(option => <GoToOption key={option.key} {...{ chapterKey, option, nextChapter }} />);
}

export function GoToOption({ chapterKey, option, nextChapter }) {
  const { flagConditionCheck } = useContext(FlagsContext);
  const { language } = useContext(LanguageContext);

  return option.disabled && flagConditionCheck(option.disabled) ? (
    <div key={option.key}
      className="text-body-tertiary h5">
      &nbsp;{(option.text[language] || option.text["en"])}&nbsp;
    </div>
  ) : (
    <a key={option.key}
      className="link link-secondary link-offset-2 h5"
      role="button"
      href="#"
      onClick={(e) => { e.preventDefault(); nextChapter(chapterKey, option.key); }}>
      &nbsp;{(option.text[language] || option.text["en"])}&nbsp;
    </a>
  )
}