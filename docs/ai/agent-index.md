<!-- lufia-agent-index:start (generated; replace the whole block, do not edit) -->
## Lufia Design System: component index

Shared UI comes from `@lufia/design-system`. Use a component listed here before writing one, and never invent a component or a prop.

- Import `Name` from `@lufia/design-system/components/Name`; a line with `[subpath]` imports from `@lufia/design-system/subpath` instead.
- A line is `Name: props`. `*` is required, `+N` counts props not listed, `(a, b?)` are hook arguments, `<X>` is the export described when it is not `Name`, `also` names other exports of the same path.
- Status is beta unless the line says otherwise; alpha and beta may change in a minor release.
- Types, defaults, examples, keyboard and accessibility: `npx --no-install lufia-ai show Name`. To find a component for a task: `npx --no-install lufia-ai search "task"`.
- Every visible string is a prop (translate in the app). Style with `--lufia-*` semantic tokens only. Links render through `LufiaProvider`. Interactive components are client components.

### Actions

- ActionIcons (deprecated): <DeleteIcon> size title | also DuplicateIcon EditIcon OpenIcon +2
- Button: variant size loading fullWidth iconStart iconEnd href disabled
- IconButton: aria-label* icon* href title variant size loading disabled
- Link: href* externalLabel
- MoreActions: label* items* align size variant icon presentation narrowOnlyScope defaultOpen
- PageActions: moreLabel* primary secondary overflow size collapse hideBelow primaryPlacement

### Forms

- Checkbox: label* hint error indeterminate
- Combobox: options* loadingLabel* emptyLabel* name value defaultValue onValueChange onQueryChange filter loading resultsLabel maxResults +9
- DateField: type value defaultValue onValueChange min max step clearLabel invalid
- DateRangeField: legend* startLabel* endLabel* type value defaultValue onValueChange min max step startName endName +6
- FileField: chooseLabel* formatRejection* replaceLabel dropLabel emptyLabel maxSize maxFiles removeLabel removeText describeFiles locale preview +4
- FormField: label* id hint error required nativeRequired disabled requiredLabel | also FormFieldContext useFormFieldControl useFormFieldLabelId
- ListField: label* labels* name items defaultItems onChange serialize sanitizeItem maxItems itemMaxLength maxTotalLength required +8
- PendingSubmit: pendingLabel* progress pending variant size fullWidth
- RadioGroup: options* label aria-label aria-labelledby hint error required disabled value defaultValue onValueChange name +4
- SearchInput: onChange value defaultValue onValueChange onSearch debounceMs clearLabel shortcut loading loadingLabel invalid
- SegmentedToggle: label* options* value defaultValue onValueChange allowDeselect onDeselect disabled name width size
- Select: size variant options groups placeholder allowEmpty invalid
- Switch: label* name defaultChecked hint error checked onCheckedChange value | also SwitchInput
- TextInput: size prefix suffix invalid
- Textarea: invalid showCount formatCount formatCountAnnouncement autoSize maxRows

### Overlays

- CommandPalette: open* onOpenChange* items* labels* hint hintPlacement notice filter onQueryChange loading groupOrder bodyOverride +5
- ConfirmDialog: open* title* message* confirmLabel* cancelLabel* onConfirm* onCancel* closeLabel container sheetPlacement classNames size +2 | also useConfirmDialog
- Modal: open* onClose* title* description size sheetPlacement titleWrap scrollShadow keepMounted renderAs classNames headerAction +12
- NotificationCenter: label* unreadCount* unreadLabel* unreadCountLabel* items* tabs activeTab defaultActiveTab onTabChange groups summary onMarkAllRead +15 | also NotificationPanel NotificationSummary
- Popover: trigger* label* open defaultOpen onOpenChange placement align initialFocus
- Tour: steps* open* labels* stepIndex defaultStepIndex onStepChange onClose onFinish spotlightPadding

### Navigation

- AppShell: groups* labels* currentPath isActive brand context footer topBarEnd search searchTrigger primaryAction desktopPrimaryFallback +29 | also MobileFloatBar MobileFloatBarButton MobileFloatBarSeparator +13
- NavRow: title* description meta badge icon href onClick disabled
- PageHeader: title* eyebrow headingLevel description actions
- Pagination: page* totalPages* onPageChange* labels* total hrefFor siblingCount variant buttonClassName disabledMode
- PeerNav: label* items* value defaultValue onValueChange layout onItemClick phoneGrid
- SectionHeader: title* headingLevel description actions titleId
- Stepper: steps* current* onStepClick

### Data display

- ActivityList: items* timeline
- AttentionList: items groups barStyle
- Badge: tone dot truncate | also StatusBadge
- BarList: title* rows* summary total reference titleVisibility valueWrap
- BulletBar: value* target* label* headroom tone
- Card: title headingLevel description headerAction footer href padding flush divider
- Checklist: items* title statusLabels density
- CitationList: items* title
- ColumnChart: title* series* columns* titleVisibility summary formatValue legend interactive printValues bandLabel columnLabel
- DetailAttentionCard: tone* title* description meta action toneLabel
- DetailList: rows*
- DetailSectionCard: title* description icon action
- ProgressBar: value* label* max valueText tone size animateChanges
- QueueSummary: items* clearLabel* allClearTitle* allClearBody unknownValue
- SortableTh: dir* label* active* onSort*
- Sparkline: values* label* variant tone
- StackedBar: segments* label* formatValue formatPercent legend showPercent
- StatTile: label* value* tone toneSurface layout labelLines quiet delta trend trendLabel deltaTone hint +6
- StatusTimeline: tracks*
- TableToolbar: filters activeFilter onFilterChange search onSearchChange searchPlaceholder clearSearchLabel variant

### Feedback

- Banner: variant title icon action onDismiss dismissLabel size lead live animateIn
- EmptyState: title* icon body action
- SkeletonCard: padding header lines block still
- SkeletonPageHeader: eyebrow description actions still
- SkeletonTable: rows columns stackBelow still
- StatusIcon: tone* variant size label drawOn
- SuccessCheck: title size
- Toast: <ToastProvider> placement limit duration container toneAliases viewportClassName | also useOptionalToast useToast

### Motion

- AnimatedNumber [motion]: value* format duration
- ChangeHighlight [motion]: value*
- Collapse [motion]: open*
- Reveal [motion]: show* variant appear onExited
- RouteTransition [motion]: transitionKey* variant
- Skeleton [motion]: variant width height still label
- Stagger [motion]: limit

### Utilities

- ChartKit: types only
- Icon: size title | also ArrowDownIcon ArrowLeftIcon ArrowRightIcon +48
- LufiaProvider: linkComponent labels | also LufiaLink useLufia
- VisuallyHidden

### Hooks

- useBodyScrollLock: (locked, options?)
- useDismiss: (open, close, root, toggle?, portalled?)
- useFocusTrap: (open, ref, options?)
- useMediaQuery: (query, options?)
- useModalState: (options?)
- usePagination: (items, pageSize?, resetKey?)
- usePrefersReducedMotion [motion]: ()
- useSlidingIndicator: (container, activeSelector, key, options?)
- useStepDirection: (step, active?)

<!-- lufia-agent-index:end -->
