export interface securityResult {
  success: boolean
  error: string
}
export interface changePwdInput {
  oldpwd: string
  newpwd: string
}

export interface iSecurity {
  isAuthenticated() : boolean 
  logOn(pwd:string): Promise<string>
  changePassword(oldpass:string, newpass:string) : Promise<securityResult>
}