import { useMemo } from "react";

export interface SuccessQueryFlagHook {
  initialSuccess: boolean;
  updateSuccessFlag: (enabled: boolean) => void;
}

const readCurrentUrl = (): URL => new URL(window.location.href);

export const useSuccessQueryFlag = (): SuccessQueryFlagHook => {
  const initialSuccess = useMemo(() => readCurrentUrl().searchParams.get("success") === "1", []);

  const updateSuccessFlag = (enabled: boolean): void => {
    const url = readCurrentUrl();

    if (enabled) {
      url.searchParams.set("success", "1");
    } else {
      url.searchParams.delete("success");
    }

    const queryString = url.searchParams.toString();
    const targetUrl = `${url.pathname}${queryString.length > 0 ? `?${queryString}` : ""}`;
    window.history.pushState({}, "", targetUrl);
  };

  return {
    initialSuccess,
    updateSuccessFlag,
  };
};
