# Keymap Studio

Open-source configurator for custom **Vial and VIA keyboards**. Remap keys and Fn layers, customise lighting and layout, create macros, test switches and back up your settings.

[Project website](https://leonixttv.github.io/keymap-studio/) · [Portable downloads](https://github.com/Leonixttv/keymap-studio/releases/latest) · [Italian guide](LEGGIMI.md) · [Report an issue](https://github.com/Leonixttv/keymap-studio/issues)

## Supported keyboards

Vial protocol 5/6 and VIA protocol 12/13 keyboards are supported when they expose the required USB interface (VIA also needs the manufacturer's matching JSON). The project owner confirms compatibility with the SAM60 H; the firmware version and tested features have not yet been documented. See the [keyboard compatibility table](COMPATIBILITY.md) for requirements, limitations, and how to report a test.

![Keymap Studio keymap](docs/assets/mappa.png)

## Getting started

| Platform | Portable package |
| --- | --- |
| Windows x64 | Open the EXE directly. |
| macOS Apple Silicon or Intel | Extract the appropriate ZIP and open Keymap Studio.app. This build is ad-hoc signed and is not notarized. |
| Linux x64 | Extract the archive and run `./keymap-studio` from the extracted folder. USB access may need a [udev rule](https://get.vial.today/manual/linux-udev.html). |

- For **Vial protocols 5 and 6**, choose **Connect via USB**. For **VIA protocols 12 and 13**, first load the keyboard maker's JSON via **VIA definition**.
- Select a key on the keymap or press it, assign an action and choose **Write to keyboard**.
- The site and primary app controls are available in English, Italian, Spanish, French and German. Some advanced messages remain in Italian. Keyboard legends support ten layouts and follow a separate setting from your operating system's input language.
- Choose an interface theme under **Layout → Appearance**. This is independent of the keyboard preview colours and is saved as an app preference.
- Hardware features depend on the firmware. USB workflows were tested with simulated devices. Firmware flashing and proprietary VIA menus remain outside this release.

### VIA definitions and troubleshooting

Keymap Studio does not currently download definitions from the VIA GitHub repository. Download the raw JSON for your exact keyboard and load it using **VIA definition** before connecting. A GitHub HTML page saved as a `.json` file is not a valid definition. The USB vendor and product IDs in the file must match the connected device, and its firmware must expose a supported VIA protocol and Raw HID interface. For example, the community has reported that a YMD75 works in VIA but does not connect in Keymap Studio; the cause is still under investigation. Please include the exact error, OS, connection method, USB IDs and firmware version when reporting a connection problem.

Rotary encoder editing is under **Advanced → Rotary encoders** when the firmware definition exposes them. Not all firmware supports encoder remapping, and the keymap view does not yet display rotary actions alongside the keys.

## Build from source

Install Node.js 24, then run `npm ci`. Use `npm start` to run from source.

| Platform | Build command |
| --- | --- |
| Windows | `npm run build:portable` |
| macOS | `npm run build:mac -- --arm64` or `npm run build:mac -- --x64` |
| Linux | `npm run build:linux -- --x64` |

The source is released under [GPL-2.0-or-later](COPYING). Third-party components retain their own licences.
