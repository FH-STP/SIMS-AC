using System.Threading.Tasks;
using sims.Controllers;
using sims.Models;

namespace sims.myUnitTests;

public class UnitTest1
{
    // Für Unit tests bitte in SIMS-AC/setup/api/src/Misc im Konstantenfile bitte die nötigen Anpassungen für Unit tests machen
    [Fact]
    public void Test1()
    {
        Assert.Equal(1, 1);
        Console.WriteLine("Test 1 Passed!");

    }

    [Fact]
    public async Task TestCheckPWFunction()
    {
        Assert.True(UserController.verifyPW(1, "admin123!"));
        Console.WriteLine("Test 2 Passed!");
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
        Console.WriteLine("Test 3 Passed!");
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
        Console.WriteLine("Test 4 Passed!");
    }

    [Fact]
    public async Task DisableUser()
    {
        Assert.False(UserController.DisableUserInDB(1122)); // Den User gibt es nicht, wird nicht erzeugt, Unit Test crashed statt false
        Console.WriteLine("Test 5 Passed!");
    }

    [Fact]
    public async Task ConclusionInformaion()
    {
        Assert.Equal("1 System - Empty False False ", ConclusionController.ConclusionInfo(1));
        Assert.Equal("2 False Positiv False False ", ConclusionController.ConclusionInfo(2));
        Assert.Equal("3 False Positiv - Info False True ", ConclusionController.ConclusionInfo(3));
        Assert.Equal("4 True Positiv - Scan True True ", ConclusionController.ConclusionInfo(4));
        Console.WriteLine("Test 6 Passed!");
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
        Console.WriteLine("Test 7 Passed!");
    }

    [Fact]
    public async Task CheckIncidentFunktion()
    {
        IncidentController.InserTestIncidents();
        Thread.Sleep(1000);
        Incident[] incidentList = IncidentController.getIncidentListfromDB();
        if (!(incidentList == null || incidentList.Length == 0)) //Kontrolliert ob leer
            Assert.True(true);
        else
            Assert.True(false);
        Assert.Equal(1, IncidentController.changeOwner(1, 1));
        Console.WriteLine("Test 8 Passed!");
    }
}