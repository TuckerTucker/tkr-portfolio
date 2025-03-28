import type { Story } from "@ladle/react";
import styles from './welcome.module.css';

/**
 * Welcome story that showcases the portfolio's design system including theme colors,
 * spacing units, and animations.
 * 
 * @component
 * @example
 * ```tsx
 * <Welcome />
 * ```
 */
export const Welcome: Story = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Tucker's Portfolio Components</h1>
      
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Theme Colors</h2>
        <div className={styles.grid}>
          <div className={styles.colorItem}>
            <div className={`${styles.colorSwatch} ${styles.nutrienBg}`}></div>
            <span>Nutrien (Sage)</span>
          </div>
          <div className={styles.colorItem}>
            <div className={`${styles.colorSwatch} ${styles.worldplayBg}`}></div>
            <span>Worldplay (Golden)</span>
          </div>
          <div className={styles.colorItem}>
            <div className={`${styles.colorSwatch} ${styles.shawBg}`}></div>
            <span>Shaw (Purple)</span>
          </div>
          <div className={styles.colorItem}>
            <div className={`${styles.colorSwatch} ${styles.taskboardBg}`}></div>
            <span>Taskboard (Pink)</span>
          </div>
          <div className={styles.colorItem}>
            <div className={`${styles.colorSwatch} ${styles.tuckerBg}`}></div>
            <span>Tucker (Dark Gray)</span>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Spacing</h2>
        <div className={styles.flexCol}>
          <div className={styles.colorItem}>
            <div className={`${styles.spacingBox} ${styles.w8}`}></div>
            <span>Small (8px)</span>
          </div>
          <div className={styles.colorItem}>
            <div className={`${styles.spacingBox} ${styles.w16}`}></div>
            <span>Medium (16px)</span>
          </div>
          <div className={styles.colorItem}>
            <div className={`${styles.spacingBox} ${styles.w24}`}></div>
            <span>Large (24px)</span>
          </div>
          <div className={styles.colorItem}>
            <div className={`${styles.spacingBox} ${styles.w32}`}></div>
            <span>XL (32px)</span>
          </div>
        </div>
      </section>

      <section>
        <h2 className={styles.sectionTitle}>Animations</h2>
        <div className={styles.grid}>
          <div className={styles.animationContainer}>
            <div className={`${styles.animationBox} ${styles.nutrienBg} ${styles.slideFromLeft}`}>
              Slide from Left
            </div>
          </div>
          <div className={styles.animationContainer}>
            <div className={`${styles.animationBox} ${styles.worldplayBg} ${styles.slideFromRight}`}>
              Slide from Right
            </div>
          </div>
          <div className={styles.animationContainer}>
            <div className={`${styles.animationBox} ${styles.shawBg} ${styles.fadeIn}`}>
              Fade In
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

/**
 * Story metadata for Ladle
 * @type {string}
 */
Welcome.storyName = "Welcome";
