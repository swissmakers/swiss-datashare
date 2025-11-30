import { useRef, useState } from "react";
import { IoOpenOutline } from "react-icons/io5";
import { TbCheck, TbCopy } from "react-icons/tb";
import useTranslate from "../../hooks/useTranslate.hook";
import { useClipboard } from "../../hooks/useClipboard";
import toast from "../../utils/toast.util";
import { Input } from "../ui";

function CopyTextField(props: { link: string }) {
  const clipboard = useClipboard({ timeout: 500 });
  const t = useTranslate();

  const [checkState, setCheckState] = useState(false);
  const [textClicked, setTextClicked] = useState(false);
  const timerRef = useRef<number | ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const copyLink = () => {
    clipboard.copy(props.link);
    toast.success(t("common.notify.copied-link"));
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setCheckState(false);
    }, 1500);
    setCheckState(true);
  };

  return (
    <div className="relative">
      <Input
        readOnly
        label={t("common.text.link")}
        value={props.link}
        onClick={() => {
          if (!textClicked) {
            copyLink();
            setTextClicked(true);
          }
        }}
        className="pr-20"
      />
      <div className="absolute right-2 top-8 flex items-center gap-1">
        <a
          href={props.link}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title={t("common.text.navigate-to-link")}
        >
          <IoOpenOutline size={18} />
        </a>

        {typeof window !== "undefined" && window.isSecureContext && (
          <button
            onClick={copyLink}
            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title={t("common.button.clickToCopy")}
          >
            {checkState ? (
              <TbCheck className="text-green-600 dark:text-green-400" size={18} />
            ) : (
              <TbCopy size={18} />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export default CopyTextField;
