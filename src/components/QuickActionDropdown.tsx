import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuGroup, 
    DropdownMenuItem, 
    DropdownMenuLabel, 
    DropdownMenuSeparator, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

type DropdownOption = {
    label: string;
    href: string;
};

interface propInterface {
    children: React.ReactNode; 
    headerLabel: string; 
    headerLink?: string; 
    options?: DropdownOption[]; 
    onFooterClick?: ()=> void; 
    footerLabel?: string; 
}

export default function QuickActionDropdown({ children, headerLabel, headerLink='#', options, onFooterClick, footerLabel }: propInterface) {
    const router = useRouter();
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {children}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="inline-block mx-2" align="start">
                <DropdownMenuLabel onClick={()=> router.push(`${headerLink}`) }>{headerLabel}</DropdownMenuLabel>
                {
                    options ?
                    <>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        {options?.map((option, index) => {
                            return (<DropdownMenuItem key={index} onClick={() => window.location.href = option.href}>
                                {option.label}
                            </DropdownMenuItem>)
                        })}
                    </DropdownMenuGroup>
                    </> : null
                }
                
                {
                    footerLabel ? 
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel onClick={onFooterClick} className="cursor-pointer">{footerLabel}</DropdownMenuLabel>
                    </>
                    : null
                }
                
            </DropdownMenuContent>
        </DropdownMenu>
    )
}