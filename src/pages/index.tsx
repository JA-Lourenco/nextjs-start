import Head from "next/head";
import Image from "next/image";
import { GetStaticProps } from "next";

import { db } from "@/services/firebase";
import { collection, getDocs } from "firebase/firestore";

import heroImg from "../../public/assets/hero.png";

import styles from "@/styles/home.module.css";

interface HomeProps {
  posts: number;
  comments: number;
}

export default function Home({ posts, comments }: HomeProps) {
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
            <span>+{posts} posts</span>
          </section>

          <section className={styles.box}>
            <span>+{comments} comments</span>
          </section>
        </div>
      </main>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const postRef = collection(db, "task");
  const commentRef = collection(db, "comment");

  const postSnapshot = await getDocs(postRef);
  const commentSnapshot = await getDocs(commentRef);

  return {
    props: {
      posts: postSnapshot.size || 0,
      comments: commentSnapshot.size || 0,
    },
    revalidate: 60,
  };
};
