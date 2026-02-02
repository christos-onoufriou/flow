import React, { ReactNode } from "react";
import styles from "./AppShell.module.css";

interface AppShellProps {
    header?: ReactNode;
    leftSidebar?: ReactNode;
    rightSidebar?: ReactNode;
    children: ReactNode; // Canvas
}

export function AppShell({ header, leftSidebar, rightSidebar, children }: AppShellProps) {
    return (
        <div className={styles.shell}>
            <header className={styles.header}>{header}</header>
            <aside className={styles.leftSidebar}>{leftSidebar}</aside>
            <main className={styles.canvasArea}>{children}</main>
            <aside className={styles.rightSidebar}>{rightSidebar}</aside>
        </div>
    );
}
