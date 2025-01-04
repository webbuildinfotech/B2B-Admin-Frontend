    import React, { memo, useMemo } from 'react';
    import { FixedSizeList } from 'react-window';

    const ListboxComponent = React.forwardRef((props, ref) => {
        const { children, ...other } = props;

        const LISTBOX_PADDING = 8; // Match Material-UI Autocomplete padding

        // Memoize itemData to avoid unnecessary calculations
        const itemData = useMemo(() => React.Children.toArray(children), [children]);

        // console.log("Rendered ListboxComponent", { itemData }); // Debugging

        const itemCount = itemData.length;
        const itemSize = 46; // Customize item height

        const getHeight = () =>
            Math.min(300, itemCount * itemSize + 2 * LISTBOX_PADDING);

        return (
            <div ref={ref} {...other} style={{ margin: LISTBOX_PADDING }}>
                <FixedSizeList
                    height={getHeight()}
                    width="100%"
                    itemSize={itemSize}
                    itemCount={itemCount}
                    overscanCount={5} // Preload extra items for smoother scrolling
                >
                    {({ index, style }) => (
                        <div style={style}>{itemData[index]}</div>
                    )}
                </FixedSizeList>
            </div>
        );
    });

    // Use memoization with a custom comparison function
    export default memo(ListboxComponent, (prevProps, nextProps) => prevProps.children === nextProps.children);
