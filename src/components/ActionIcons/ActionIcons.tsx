import { ClockIcon, CopyIcon, EditIcon, FileTextIcon, RotateCcwIcon, TrashIcon } from "../Icon/icons";

export type { IconProps } from "../Icon/Icon";

/** @deprecated Use `TrashIcon` from the icon set. Removed in the next minor release. */
export const DeleteIcon = TrashIcon;

/** @deprecated Use `CopyIcon` from the icon set. Removed in the next minor release. */
export const DuplicateIcon = CopyIcon;

/** @deprecated Use `ClockIcon` from the icon set. Removed in the next minor release. */
export const PendingIcon = ClockIcon;

/** @deprecated Use `RotateCcwIcon` from the icon set. Removed in the next minor release. */
export const OpenIcon = RotateCcwIcon;

/** @deprecated Use `FileTextIcon` from the icon set. Removed in the next minor release. */
export const ReportIcon = FileTextIcon;

export { EditIcon };

/** @deprecated Use the named icons, or `ICONS` for a gallery. Removed in the next minor release. */
export const ACTION_ICONS = /* @__PURE__ */ Object.freeze({
  DeleteIcon,
  EditIcon,
  DuplicateIcon,
  PendingIcon,
  OpenIcon,
  ReportIcon,
} as const);
