import { unstable_usePrompt as usePrompt, useBeforeUnload } from 'react-router-dom';

const DEFAULT_MESSAGE = 'You have unsaved changes. Leave this page?';

export function useUnsavedChangesWarning(
  enabled: boolean,
  message: string = DEFAULT_MESSAGE
) {
  usePrompt({ when: enabled, message });

  useBeforeUnload(
    (event) => {
      if (!enabled) return;
      event.preventDefault();
      event.returnValue = '';
    },
    { capture: true }
  );
}
