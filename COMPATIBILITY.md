# Keyboard compatibility

Keymap Studio supports **firmware protocols**, rather than a guaranteed list of keyboard models. A keyboard's firmware and configuration determine whether it works; the name or PCB alone is not enough. USB workflows have been tested with simulated devices. Physical keyboard reports are identified separately below.

| Keyboard or firmware | Requirements | Verification status |
| --- | --- | --- |
| Vial keyboards | USB Raw HID interface (usage page `0xff60`, usage `0x61`); Vial protocol 5 or 6; usable embedded keyboard definition | Protocol tested with simulated devices; physical keyboards unverified |
| VIA keyboards | USB Raw HID interface (usage page `0xff60`, usage `0x61`); VIA protocol 12 or 13; matching manufacturer-provided VIA JSON definition | Protocol tested with simulated devices; physical keyboards unverified |
| SAM60 H | Requires compatible Vial/VIA firmware and, for VIA, a matching JSON definition | Compatibility confirmed by the project owner; firmware version, operating system and individual features not yet documented |
| Other custom keyboards | Must meet the Vial or VIA requirements above | Physical keyboards unverified |
| Proprietary, other protocol versions, or non-Vial/VIA firmware | Not currently supported | Not tested |

Availability of features such as lighting, macros, encoders and advanced settings depends on firmware. Proprietary VIA menus and firmware flashing are not supported. Wireless connections are not covered by these USB tests.

To help us verify a keyboard, please [open an issue](https://github.com/Leonixttv/keymap-studio/issues) with its model and PCB, firmware and protocol version, operating system, connection method, and which features you tested. Never include serial numbers or other private information. Once a report is checked, it can be added here with a link to its evidence.
