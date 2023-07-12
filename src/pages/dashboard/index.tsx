import { useState, useEffect, ChangeEvent, FormEvent } from "react";

import Head from "next/head";
import Link from "next/link";

import { Textarea } from "@/components/Textarea";

import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { FiShare2 } from "react-icons/fi";
import { FaTrash } from "react-icons/fa";

import { db } from "@/services/firebase";
import {
  addDoc,
  collection,
  query,
  orderBy,
  where,
  onSnapshot,
  doc,
  deleteDoc,
} from "firebase/firestore";

import styles from "./styles.module.css";

interface DashboardProps {
  user: {
    email: string;
  };
}

interface TaskProps {
  id: string;
  created: Date;
  public: boolean;
  task: string;
  user: string;
}

export default function Dashboard({ user }: DashboardProps) {
  const [tasks, setTasks] = useState<TaskProps[]>([]);
  const [input, setInput] = useState("");
  const [publicTask, setPublicTask] = useState(false);

  async function loadTasks() {
    const tasks = collection(db, "task");
    const qry = query(
      tasks,
      orderBy("created", "desc"),
      where("user", "==", user?.email)
    );

    onSnapshot(qry, (snapshot) => {
      let tasksData = [] as TaskProps[];
      snapshot.forEach((doc) => {
        tasksData.push({
          id: doc.id,
          task: doc.data().task,
          created: doc.data().created,
          user: doc.data().user,
          public: doc.data().public,
        });
      });

      setTasks(tasksData);
    });
  }

  function handleChangePublic(e: ChangeEvent<HTMLInputElement>) {
    setPublicTask(e.target.checked);
  }

  async function handleRegisterTask(e: FormEvent) {
    try {
      e.preventDefault();

      if (!input) {
        alert("Please enter");
        return;
      }

      await addDoc(collection(db, "task"), {
        task: input,
        created: new Date(),
        user: user?.email,
        public: publicTask,
      });

      setInput("");
      setPublicTask(false);
    } catch (e) {
      console.error("handleRegisterTask Error: ", e);
    }
  }

  async function handleDeleteTask(id: string) {
    const docRef = doc(db, "task", id);

    await deleteDoc(docRef);
  }

  async function handleShare(id: string) {
    await navigator.clipboard.writeText(
      `${process.env.NEXT_PUBLIC_URL}/task/${id}`
    );

    alert("Copied to clipboard!");
  }

  function showTasks() {
    return tasks.map((task) => (
      <article key={task.id} className={styles.task}>
        {task.public && (
          <div className={styles.tagContainer}>
            <label className={styles.tag}>PUBLIC</label>

            <button
              type="button"
              className={styles.shareButton}
              onClick={() => handleShare(task.id)}
            >
              <FiShare2 size={22} color="var(--blue)" />
            </button>
          </div>
        )}

        <div className={styles.taskContent}>
          {task.public ? (
            <Link href={`/task/${task.id}`}>
              <p>{task.task}</p>
            </Link>
          ) : (
            <p>{task.task}</p>
          )}

          <button type="button" className={styles.trashButton}>
            <FaTrash
              size={24}
              color="var(--red)"
              onClick={() => handleDeleteTask(task.id)}
            />
          </button>
        </div>
      </article>
    ));
  }

  useEffect(() => {
    loadTasks();
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>My Tasks Panel</title>
      </Head>

      <main className={styles.main}>
        <section className={styles.content}>
          <div className={styles.contentForm}>
            <h1 className={styles.title}>What's your task?</h1>

            <form onSubmit={handleRegisterTask}>
              <Textarea
                placeholder="Write about your task..."
                value={input}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  setInput(e.target.value)
                }
              />

              <div className={styles.checkboxArea}>
                <input
                  id="markPublic"
                  type="checkbox"
                  className={styles.checkbox}
                  checked={publicTask}
                  onChange={handleChangePublic}
                />
                <label htmlFor="markPublic">Mark as public</label>
              </div>

              <button type="submit" className={styles.button}>
                Register
              </button>
            </form>
          </div>
        </section>

        <section className={styles.taskContainer}>
          <h1>My Tasks</h1>

          {showTasks()}
        </section>
      </main>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const session = await getSession({ req });

  if (!session?.user) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      user: {
        email: session?.user?.email,
      },
    },
  };
};
