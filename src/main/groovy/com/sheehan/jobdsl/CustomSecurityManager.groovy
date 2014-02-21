package com.sheehan.jobdsl

import groovy.transform.CompileStatic

import java.security.Permission

/**
 * Restrict individual Threads.
 */
@CompileStatic
class CustomSecurityManager extends SecurityManager {

    private static ThreadLocal<Boolean> restrict = new ThreadLocal<Boolean>()

    private final SecurityManager parent

    CustomSecurityManager(final SecurityManager parent) {
        this.parent = parent
    }

    CustomSecurityManager() {
        this(System.securityManager)
    }

    void checkPermission(final Permission perm) {
        parent?.checkPermission(perm)
    }

    void checkAccept(String host, int port) { failIfRestricted() }

    void checkAccess(Thread t) { failIfRestricted() }

    void checkAccess(ThreadGroup g) { failIfRestricted() }

    void checkAwtEventQueueAccess() { failIfRestricted() }

    void checkConnect(String host, int port) { failIfRestricted() }

    void checkConnect(String host, int port, Object context) { failIfRestricted() }

    void checkCreateClassLoader() {}

    void checkDelete(String file) { failIfRestricted() }

    void checkExec(String cmd) { failIfRestricted() }

    void checkExit(final int code) { failIfRestricted() }

    void checkLink(String lib) { failIfRestricted() }

    void checkListen(int port) { failIfRestricted() }

    void checkMemberAccess(Class<?> clazz, int which) {}

    void checkMulticast(InetAddress maddr) { failIfRestricted() }

    void checkPackageAccess(String pkg) {}

    void checkPackageDefinition(String pkg) { failIfRestricted() }

    void checkPrintJobAccess() { failIfRestricted() }

    void checkPropertiesAccess() { failIfRestricted() }

    void checkPropertyAccess(String key) {}

    void checkRead(String file) {}

    void checkRead(String file, Object context) {}

    void checkSetFactory() { failIfRestricted() }

    void checkSystemClipboardAccess() { failIfRestricted() }

    void checkWrite(FileDescriptor fd) { failIfRestricted() }

    void checkWrite(String file) { failIfRestricted() }

    static void failIfRestricted() {
        if (restrict.get()) {
            throw new SecurityException("not allowed!")
        }
    }

    static void restrictThread() {
        restrict.set true
    }

    static void unrestrictThread() {
        restrict.set false
    }

}
