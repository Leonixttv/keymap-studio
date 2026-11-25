using System;
using System.Diagnostics;
using System.IO;
using System.IO.Compression;
using System.Reflection;
using System.Threading;
using System.Windows.Forms;

internal static class Launcher
{
    [STAThread]
    private static int Main()
    {
        string folder = Path.Combine(Path.GetTempPath(), "Keymap-Studio-" + Guid.NewGuid().ToString("N"));
        try
        {
            Directory.CreateDirectory(folder);
            using (Stream payload = Assembly.GetExecutingAssembly().GetManifestResourceStream("StudioPayload"))
            using (ZipArchive archive = new ZipArchive(payload, ZipArchiveMode.Read))
            {
                archive.ExtractToDirectory(folder);
            }

            ProcessStartInfo info = new ProcessStartInfo(Path.Combine(folder, "Keymap Studio.exe"));
            info.WorkingDirectory = folder;
            info.UseShellExecute = false;
            using (Process app = Process.Start(info))
            {
                app.WaitForExit();
                return app.ExitCode;
            }
        }
        catch (Exception error)
        {
            MessageBox.Show("Impossibile avviare Keymap Studio.\n\n" + error.Message,
                            "Keymap Studio", MessageBoxButtons.OK, MessageBoxIcon.Error);
            return 1;
        }
        finally
        {
            for (int attempt = 0; Directory.Exists(folder) && attempt < 4; attempt++)
            {
                try { Directory.Delete(folder, true); }
                catch (IOException) { Thread.Sleep(250); }
                catch (UnauthorizedAccessException) { Thread.Sleep(250); }
            }
        }
    }
}
