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
      // Base classes from .clinerules + passed className
      className={cn("list-disc pl-5 mt-4", className)}
      {...props}
    >
      {items.map((item, index) => (
        // Using shadcn/typography li variant class from .clinerules definition
        // Assuming 'variant="li"' translates to standard li styling + mb-2
        <li key={index} className={cn(listItemClassName)}>
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
