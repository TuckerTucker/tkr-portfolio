import React from 'react';
import PropTypes from 'prop-types';
import { cn } from "@/lib/utils";

/**
 * Renders a simple bulleted list based on an array of strings.
 * Styling is based on the .clinerules definition for bullet_list.
 */
const BulletList = ({
  items = [], // Default to empty array
  className,
  listItemClassName = "mb-2", // Default from .clinerules list_item definition
  ...props
}) => {
  if (!items || items.length === 0) {
    return null; // Render nothing if there are no items
  }

  return (
    <ul
      className={cn("list-disc pl-6 mt-3 space-y-2", className)}
      {...props}
    >
      {items.map((item, index) => (
        <li key={index} className={cn("text-sm leading-relaxed", listItemClassName)}>
          {item}
        </li>
      ))}
    </ul>
  );
};

BulletList.propTypes = {
  items: PropTypes.arrayOf(PropTypes.string),
  className: PropTypes.string,
  listItemClassName: PropTypes.string,
};

export default BulletList;
