'use client';

import ImageGenerator from '../../components/ImageGenerator';
import Link from 'next/link';
import styles from './page.module.css';

export default function GeneratePage() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.header}>
          <Link href="/" className={styles.backLink}>
            ← Back to Home
          </Link>
          <h1 className={styles.title}>Generate Product Image</h1>
          <p className={styles.subtitle}>
            Enter a device name to generate an AI-powered product image
          </p>
        </div>

        <div className={styles.generatorContainer}>
          <ImageGenerator />
        </div>
      </div>
    </main>
  );
}
