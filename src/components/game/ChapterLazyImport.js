import { useContext, lazy, Suspense } from "react";
import { LanguageContext } from "../../App";

const guideHtmlStart = "<div class='alert alert-info'>";
const guideHtmlEnd = "</div>";
const guidePlaceHolderStart = "[guide-start]";
const guidePlaceHolderEnd = "[guide-end]";

function loadChapter(key) {
  return lazy(() => import(`../chapters/${key}.js`));
}

export default function Chapter({ chapterKey }) {
  const { language } = useContext(LanguageContext);

  console.log("Chapter - chapter: ", chapterKey);

  const TheChapter = loadChapter(chapterKey);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TheChapter />
    </Suspense>
  )
}