import Head from "next/head";
import Image from "next/image";

import heroImg from "../../public/assets/hero.png";

import styles from "@/styles/home.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Tasks+ | Fix Your Day</title>
      </Head>

      <main className={styles.main}>
        <div className={styles.logoContent}>
          <Image
            className={styles.hero}
            alt="Tasks+ Logo"
            src={heroImg}
            priority
          />
        </div>

        <h1 className={styles.title}>
          Platform made to optimize <br />
          your tasks management
        </h1>

        <div className={styles.infoContent}>
          <section className={styles.box}>
            <span>+12 posts</span>
          </section>

          <section className={styles.box}>
            <span>+90 comments</span>
          </section>
        </div>
      </main>
    </div>
  );
}
