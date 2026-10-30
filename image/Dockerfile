# Alpine i386 root filesystem for v86, adapted from v86's tools/docker/alpine (via TabShell).
# No network, no Node: just a shell and the usual tools for the Linux lessons.
FROM docker.io/i386/alpine:3.24.3

ENV KERNEL=virt

RUN apk add openrc alpine-base agetty alpine-conf linux-$KERNEL linux-firmware-none nano less tree file

# One autologin shell on the virtio console (hvc0) for the learner.
RUN sed -i '/getty/d' /etc/inittab \
 && echo 'hvc0::respawn:/sbin/agetty --autologin camper --noclear hvc0 xterm-256color' >> /etc/inittab \
 && echo "root:" | chpasswd \
 && adduser -D -s /bin/sh camper && passwd -d camper \
 && echo "hostname=camp" > /etc/conf.d/hostname

RUN printf 'export LANG=C.UTF-8\nexport PS1="\\[\\e[32m\\]\\u@\\h\\[\\e[0m\\]:\\[\\e[34m\\]\\w\\[\\e[0m\\]\\$ "\n' > /etc/profile.d/camp.sh \
 && printf '\nWelcome to edu-code-camp Linux. Follow the lesson on the left.\n\n' > /etc/motd

# The lesson checker. The page talks to it over the serial port, which the learner never sees:
# each line in is a base64 shell script, run as root; its output goes back in base64, then an end marker.
COPY image/camp-agent /usr/local/sbin/camp-agent
RUN chmod +x /usr/local/sbin/camp-agent \
 && echo 'ttyS0::respawn:/usr/local/sbin/camp-agent' >> /etc/inittab

# https://wiki.alpinelinux.org/wiki/Alpine_Linux_in_a_chroot#Preparing_init_services
RUN for i in devfs dmesg mdev hwdrivers; do rc-update add $i sysinit; done \
 && for i in hwclock modules sysctl hostname syslog bootmisc; do rc-update add $i boot; done \
 && rc-update add killprocs shutdown

# Generate initramfs with 9p modules
RUN mkinitfs -F "base virtio 9p" $(cat /usr/share/kernel/$KERNEL/kernel.release)
