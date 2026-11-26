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
| Keychron K2 HE ANSI | PgDn displayed as disabled on layer 2, code `0x0000`. | Unresolved on real hardware: the tester reports the issue persists with the 0.6.4-rc1 Mac build, which rechecks zero values with an individual read. The official ANSI definition maps Enter to 3,12 and the adjacent key to 3,13. Avoid writing changes while investigating. |
| YMDK YMD75 | VIA connects, but Keymap Studio rejected VIA protocol 9 on macOS via USB. | Experimental read-only support for protocol 9 is available for testing. It blocks writes and does not claim full compatibility. Hardware retesting is needed. |
| Royal Kludge RK61, custom Vial port | Connected after restarting the app; a previously loaded VIA JSON appeared to interfere. | The local change associates VIA definitions with matching USB IDs. It needs retesting on the reported devices, including cases where IDs overlap. |
| Inland MK75, Vial | Encoder directions not shown on the keymap; RGB and media codes displayed as hex. | RGB Matrix and common media labels improved; a shortcut opens the encoder editor when detected. Physical verification is pending; the directions are not displayed on the keymap. |
| YMDK DK61, PI60 HSE, GK61 DS, Womier WK61 Pro, Akko 5075 VIA and Jamesdonkey/Keychron J2 | Comparison images show key labels as hex and, on some boards, an encoder not shown on the map. | Common layer-tap, mod-tap and Fn labels improved; firmware-specific codes may remain hex. Retesting on each device is needed. GK61 Pro 48 is a separate report and remains unverified. |

To help us verify a keyboard, please [open an issue](https://github.com/Leonixttv/keymap-studio/issues) with its model and PCB, firmware and protocol version, operating system, connection method, and which features you tested. Never include serial numbers or other private information. Once a report is checked, it can be added here with a link to its evidence.
