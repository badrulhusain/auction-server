export class RegisterAdminDto {
    name!: string;
    email!: string;
    username!: string;
    password!: string;
}

export class RegisterTeamDto {
    auction_id!: string;
    name!: string;
    username!: string;
    password!: string;
    total_budget!: number;
}
