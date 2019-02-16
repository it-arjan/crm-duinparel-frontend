export interface securityResult {
  success: boolean
  error: string
}
export interface changePwdInput {
  oldpwd: string
  newpwd: string
}

export interface iSecurity {
 logOn(pwd:string): Promise<void>
  changePassword(oldpass:string, newpass:string) : Promise<securityResult>
}