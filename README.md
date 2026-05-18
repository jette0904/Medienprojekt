Hey Maus,

`brew install pnpm` wird dir pnpm installieren. Das ist der etwas bessere (schnellere) npm. Damit kannst du Dependencies installieren, wie cargo für rust, maven für java oder pip für python.

`pnpm i` installiert dann alle Dependencies, die in der package.json gelistet sind.

`pnpm dev` startet dir den Live server, dann kannst du einfach mit Cmd + Klick auf die http Adresse in der Konsole klicken.

`pnpm lint:fix` lässt dir den linter drüber laufen. Er versucht schon so viel wie er kann selber zu fixen.
