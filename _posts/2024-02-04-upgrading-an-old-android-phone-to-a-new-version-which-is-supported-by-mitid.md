---
title: Upgrading an old Android phone to a new version which is supported by MitID
date: 2024-02-04T13:08:07.157Z
description: How to create a backup device from your old phone which is not
  supported by any app anymore.
---

Sometimes major Android updates stop coming to your phone, and crucial apps, such as your bank, or the authentication app used in Denmark, MitID, no longer support your phone.
I hate buying stuff, it's bad for the environment, and trashing a phone just because it's old is just so silly.
So is it possible to somehow update your Android device to a newer version? Not really.
However, installing a newer Android _based_ distribution might very well be possible.
And it's definitely worth a shot if the alternative is trashing your phone. Let's rock!

## Check LineageOS support

I decided to install LineageOS, since it supports a lot of devices. Although it did not have official support for my device (you can check official support here: https://wiki.lineageos.org/devices/), I did find an unofficial LineageOS image on a website which looked reasonably trustworthy.
If you can't find an image for your specific device on some part of the internet, then I have no clue how you should proceed.
If you did find something, move on to...

## Unlocking your phone's bootloader

Unlocking your bootloader enables you to flash custom ROMs, kernels, etc. onto your phone.
_Note that this step will probably ruin your phone's warranty, so do it with caution._
To find instructions for your phone, just search for "unlocking [insert name of your device here] bootloader" on Google.

## Booting into TWRP

Make sure you have your phone connected to a computer, and make sure you have adb installed on your computer.
Boot into your device, and enable Developer Settings.
Run `adb reboot bootloader`.
Run `fastboot devices` (you might need sudo before the command).

Download TWRP onto your computer, cd into the download directory, then run
`fastboot boot twrpname.img`.

Now you'll be in the TWRP app. First, "Wipe" everything you have on the device (note that this will destroy all your data, but hopefully at this point that's fine).
I also needed to format the file system and remove encryption. You might want to try installing without removing encryption first, since a lot of people don't seem to need this step, and removing encryption is not nice. (Without removing encryption, I got a blank screen on install, and without formatting, I got an infinite boot cycle.)
Then you'll have to run `adb push the-path-to-lineageos-on-your-pc.img /storage/` to transfer the LineageOS image to your phone.
Then you'll need tap "Install" on TWRP's main screen, select the LineageOS image, and run the install.
If you want Google apps (which makes sense if, for example, you need your banking stuff from Google Play), you'll need to perform the previous two steps, but with the given zip file.
You can find the instructions here: https://mindthegapps.com/download/

After install, make sure to wipe the cache partitions again. Then reboot, and enjoy your OS:)

## "The device appears to be rooted"

You wanna install some app, but you see this. Install Magisk, and follow the advice of internet people.

## MitID

MitID required some extra steps to be enabled, check this Reddit post for details:
https://www.reddit.com/r/Denmark/comments/up098c/guidemitid_p%C3%A5_android_med_rootmagisk/
