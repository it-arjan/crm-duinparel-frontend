export interface iAuthResult {
  success: boolean
  error: string
}
export interface changePwdInput {
  oldpwd: string
  newpwd: string
}

export interface iAuth {
  isAuthenticated() : boolean 
  logOn(pwd:string): Promise<string>
  changePassword(oldpass:string, newpass:string) : Promise<iAuthResult>
}