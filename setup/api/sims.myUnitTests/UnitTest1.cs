using System.Threading.Tasks;
using sims.Controllers;
using sims.Models;

namespace sims.myUnitTests;

public class UnitTest1
{
    [Fact]
    public void Test1()
    {
        Assert.Equal(1, 1);
    }

    [Fact]
    public async Task TestCheckPWFunction()
    {
        Assert.True(UserController.verifyPW(1, "admin123!"));
    }

    [Fact]
    public async Task CheckGetUserInfo()
    {
        User? admin = UserController.GetUserInfoFromDB(1);
        Assert.NotNull(admin);
        Assert.True(admin.isAdmin);
        Assert.False(admin.IsDisabled);
        Assert.Equal("admin", admin.UserName);
        Assert.Equal("placeholder@test.at", admin.EMail);
        Assert.Equal("12345678", admin.Telephone);
    }

    [Fact]
    public async Task CheckPasswordStrengthFunction()
    {
        Assert.True(UserController.checkPWRequriements("admin123!"));
        Assert.True(UserController.checkPWRequriements("Admin123!"));
        Assert.True(UserController.checkPWRequriements("Lada4200"));
        Assert.True(UserController.checkPWRequriements("lalaLAGA!"));
        Assert.True(UserController.checkPWRequriements("AAAAAA123!"));
        Assert.True(UserController.checkPWRequriements("AAArrggghh..."));
        Assert.False(UserController.checkPWRequriements("admin1234"));
        Assert.False(UserController.checkPWRequriements("ADMIN!!!!"));
        Assert.False(UserController.checkPWRequriements("lada4200"));
        Assert.False(UserController.checkPWRequriements("lalaLAGA"));
        Assert.False(UserController.checkPWRequriements("kurz"));
        Assert.False(UserController.checkPWRequriements("lllllllllllllllllllaaaaaaaaaaaaaaaaannnnnnnnnnnnnnngggggggggggg"));
    }

    [Fact]
    public async Task DisableUser()
    {
        Assert.False(UserController.DisableUserInDB(1122));
    }

    [Fact]
    public async Task ConclusionInformaion()
    {
        Assert.Equal("1 System - Empty False False ", ConclusionController.ConclusionInfo(1));
        Assert.Equal("2 False Positiv False False ", ConclusionController.ConclusionInfo(2));
        Assert.Equal("3 False Positiv - Info False True ", ConclusionController.ConclusionInfo(3));
        Assert.Equal("4 True Positiv - Scan True True ", ConclusionController.ConclusionInfo(4));
    }

    //TODO Create Incident
    public async Task ConclusionInformaion()
    {
        Assert.Equal("1 System - Empty False False ", ConclusionController.ConclusionInfo(1));
    }

    [Fact]
    public async Task CheckIncidentCreation()
    {
        Boolean wentWell = true;
        try
        {
            IncidentController.CreateIncidentDB(new Incident(1, 1, 1, "Wallah", "{}", "asdf", 1, 1, 1, DateTime.Now, false));
        }
        catch
        {
            wentWell = false;
        }
        Assert.True(wentWell);
    }

    [Fact]
    public async Task CheckIncidentFunktion()
    {
        
        sleep(1000);
    }
}