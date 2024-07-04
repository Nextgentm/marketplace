import React, { useMemo } from 'react';
import Image from 'next/image';
import styles from './Loader.module.css';

const AppLoader = () => {
  const memoizedImage = useMemo(() => (
    <img src="/assets/loader/loader.200.120kb.gif" width={200} height={200} alt="Loader..." />
  ), []);

  return (
    <div className={styles.fullPageLoader}>
      <div className={styles.overlay}></div>
      <div className={styles.loaderContainer}>
        {memoizedImage}
      </div>
    </div>
  );

};

export default AppLoader