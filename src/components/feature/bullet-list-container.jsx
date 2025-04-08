import React from 'react';
import PropTypes from 'prop-types';
import { cn } from "@/lib/utils";
import BulletList from '@/components/custom/bullet-list';

/**
 * Container for the BulletList component, styled as a card section.
 * Based on .clinerules definition for bullet_list container.
 */
const BulletListContainer = ({
  items = [],
  className,
  listClassName,
  listItemClassName,
  ...props
}) => {
  return (
    <div
      className={cn("bg-white p-6", className)} // Base container styles from .clinerules
      role="list" // Accessibility from .clinerules
      aria-label="Project features" // Accessibility from .clinerules
      {...props}
    >
      <BulletList
        items={items}
        className={listClassName}
        listItemClassName={listItemClassName}
      />
    </div>
  );
};

BulletListContainer.propTypes = {
  items: PropTypes.arrayOf(PropTypes.string),
  className: PropTypes.string,
  listClassName: PropTypes.string,
  listItemClassName: PropTypes.string,
};

export default BulletListContainer;
