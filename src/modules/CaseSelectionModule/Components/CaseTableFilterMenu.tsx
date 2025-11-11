import React, {Dispatch, Fragment, SetStateAction, useState} from 'react';
import {Menu} from 'react-native-paper';
import TableMenu from './TableMenu';
import Checkbox from '@components/Checkbox';

type CaseTableFilterMenuProps = Readonly<{
  menuItemArr: Array<{[key: string]: string | number | boolean}>;
  selectedMenuItem: Array<number>;
  setSelectedMenuItem: Dispatch<SetStateAction<Array<number>>>;
}>;

export default function CaseTableFilterMenu({
  menuItemArr = [],
  selectedMenuItem,
  setSelectedMenuItem,
}: CaseTableFilterMenuProps) {
  // Handle selection/deselection of a menu item
  const toggleMenuItem = (index: number) => {
    setSelectedMenuItem(prev =>
      prev.includes(index)
        ? prev.filter(itm => itm !== index)
        : [...prev, index],
    );
  };

  const [isMenuVisible, setIsMenuVisible] = useState(false);

  return (
    <TableMenu
      isMenuVisible={isMenuVisible}
      setIsMenuVisible={setIsMenuVisible}>
      {menuItemArr.map((item, index) =>
        item?.value ? (
          <FilterMenuItem
            key={String(item?.key)}
            index={index}
            isSelected={selectedMenuItem.includes(index)}
            title={item?.value}
            onToggle={toggleMenuItem}
          />
        ) : (
          <Fragment key={String(item?.key)} />
        ),
      )}
    </TableMenu>
  );
}

// Separate component for individual Menu Items
type FilterMenuItemProps = {
  index: number;
  isSelected: boolean;
  title: string | number | boolean;
  onToggle: (index: number) => void;
};

const FilterMenuItem = ({
  index,
  isSelected,
  title,
  onToggle,
}: FilterMenuItemProps) => {
  const handlePress = () => onToggle(index);

  return (
    <Menu.Item
      onPress={handlePress}
      leadingIcon={() => getLeadingIcon(isSelected)}
      title={title}
    />
  );
};

const getLeadingIcon = (isSelected: boolean) => (
  <Checkbox isChecked={isSelected} />
);
