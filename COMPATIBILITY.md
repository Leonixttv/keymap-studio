# Keyboard compatibility

Keymap Studio supports **firmware protocols**, rather than a guaranteed list of keyboard models. A keyboard's firmware and configuration determine whether it works; the name or PCB alone is not enough. USB workflows have been tested with simulated devices. Physical keyboard reports are identified separately below.

| Keyboard or firmware | Requirements | Verification status |
| --- | --- | --- |
| Vial keyboards | USB Raw HID interface (usage page `0xff60`, usage `0x61`); Vial protocol 5 or 6; usable embedded keyboard definition | Protocol tested with simulated devices; physical keyboards unverified |
| VIA keyboards | USB Raw HID interface (usage page `0xff60`, usage `0x61`); VIA protocol 12 or 13; matching manufacturer-provided VIA JSON definition | Protocol tested with simulated devices; physical keyboards unverified |
| SAM60 H | Requires compatible Vial/VIA firmware and, for VIA, a matching JSON definition | Project owner and a Discord community member report it works; firmware versions, operating systems and individual features not yet documented |
| YMDK DK61 (Minila) | Vial firmware | [Community report](https://www.reddit.com/r/olkb/comments/1y5znwh/comment/19t82e01uk74y/): layout displayed; key labels need improvement. Other features not verified |
| 1upKeyboards PI60 HSE | Vial firmware | [Community comparison](https://www.reddit.com/r/olkb/comments/1y5znwh/comment/19t82kr4mlhr4/); firmware version and tested features not documented |
| Womier WK61 Pro | VIA firmware | [Community comparison](https://www.reddit.com/r/olkb/comments/1y5znwh/comment/19t830465saw5/); firmware version and tested features not documented |
| Keychron K2 HE | Firmware and protocol version not documented | [Community report](https://www.reddit.com/r/olkb/comments/1y5znwh/comment/19t83g93dxbtx/): PgDn works but appeared disabled; under investigation |
| GK61 DS / Pro 48 | Matching VIA JSON; firmware version not documented | [Community follow-up](https://www.reddit.com/r/olkb/comments/1y5znwh/comment/19t88tdmsq5nl/): connected after using the correct VIA JSON; other features not verified |
| Other custom keyboards | Must meet the Vial or VIA requirements above | Physical keyboards unverified |
| Proprietary, other protocol versions, or non-Vial/VIA firmware | Not currently supported | Not tested |

Availability of features such as lighting, macros, encoders and advanced settings depends on firmware. Proprietary VIA menus and firmware flashing are not supported. Wireless connections are not covered by these USB tests.

Community [reports on Reddit](https://www.reddit.com/r/olkb/comments/1y5znwh/) are useful feedback, not complete compatibility certifications:

| Keyboard | Community report | Current status |
| --- | --- | --- |
| Keychron K2 HE ANSI | PgDn displayed as disabled; VIA shows the same discrepancy, while Keychron Launcher shows the key. | Unresolved: a [macOS diagnostic](https://pastebin.com/B0S8HByg) from 0.6.5 reports `0x0000` in both reads at layer 0, row 3, col 13. A later [layer 2 report](https://pastebin.com/1Rr6GuTW) also reads `0x0000` at the same position, while a [PgUp comparison](https://pastebin.com/vSbXf6Ez) reads `0x004B` at row 2, col 14. The [exact JSON](https://pastebin.com/1VM78rZW) and physical-selection offset were reported; selecting a key by its output is only an inference and the position discrepancy and reported USB disconnect remain under investigation. Keychron’s [published ANSI factory keymap](https://github.com/Keychron/qmk_firmware/blob/hall_effect_playground/keyboards/keychron/k2_he/ansi_rgb/keymaps/default/keymap.c) places PgDn one row above Home. The firmware source uses a different USB product ID, so the app does not override this unit’s mapping. On VIA firmware that exposes switch state, use **Select from USB matrix** to identify the physical position and then generate a diagnostic report. The Home disconnect remains unverified on hardware. |
| YMDK YMD75 | VIA protocol 9 over USB on macOS. | [Tester reports](https://www.reddit.com/r/olkb/comments/1y5znwh/comment/19t9g5ychszdw/) the keyboard is recognized in 0.6.5 RC1 and its map is shown. In the current development version, basic key editing is experimental and has only been tested in simulation; it has not yet been verified on this keyboard. Advanced editing remains disabled. |
| Royal Kludge RK61, custom Vial port | A previously loaded VIA JSON appeared to interfere. | [Tester reports](https://www.reddit.com/r/olkb/comments/1y5znwh/comment/19t9g5ychszdw/) the board now connects and is recognized. Cases where USB IDs overlap and other features remain unverified. |
| Inland MK75, Vial | Encoder directions not shown on the keymap; RGB and media codes displayed as hex. | RGB Matrix and common media labels improved; a shortcut opens the encoder editor when detected. Physical verification is pending; the directions are not displayed on the keymap. |
| YMDK DK61, PI60 HSE, GK61 DS, Womier WK61 Pro, Akko 5075 VIA and Jamesdonkey/Keychron J2 | Comparison images show key labels as hex and, on some boards, an encoder not shown on the map. | Common layer-tap, mod-tap and Fn labels improved; firmware-specific codes may remain hex. Retesting on each device is needed. GK61 Pro 48 is a separate report and remains unverified. |

To help us verify a keyboard, please [open an issue](https://github.com/Leonixttv/keymap-studio/issues) with its model and PCB, firmware and protocol version, operating system, connection method, and which features you tested. Never include serial numbers or other private information. Once a report is checked, it can be added here with a link to its evidence.
