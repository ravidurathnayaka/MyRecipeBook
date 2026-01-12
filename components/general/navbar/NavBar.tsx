import { auth } from "@/app/utils/auth";
import NavBarClient from "./NavbarClient";

const Navbar = async () => {
  const session = await auth();
  return <NavBarClient session={session} />;
};

export default Navbar;
